/**
 * Data Source Abstraction Layer
 * Allows easy switching between mock data and real Odoo data
 * 
 * To switch data sources:
 * 1. Change DATA_SOURCE constant below
 * 2. Restart the server
 * 
 * Available sources:
 * - "mock": Use hardcoded mock data (default)
 * - "odoo": Fetch from Odoo instance (requires valid credentials)
 * - "database": Fetch from local database (requires Odoo sync to have run)
 */

import type { Opportunity } from "../drizzle/schema";
import { getAllOpportunities } from "./opportunities.db";
import { mockOpportunities } from "./mock-opportunities";
import { ENV } from "./_core/env";

// ============================================================================
// CONFIGURATION: Change this to switch data sources
// ============================================================================
const DATA_SOURCE = process.env.CRM_DATA_SOURCE || "mock"; // "mock" | "odoo" | "database"
// ============================================================================

export type DataScope = "all" | "team" | "mine";

/**
 * Get all opportunities from the configured data source
 */
export async function getOpportunitiesFromSource(scope: DataScope = "team"): Promise<Opportunity[]> {
  console.log(`[DataSource] Using data source: ${DATA_SOURCE}`);

  switch (DATA_SOURCE) {
    case "mock":
      return getMockOpportunities();

    case "database":
      return getDatabaseOpportunities();

    case "odoo":
      return getOdooOpportunities(scope);

    default:
      console.warn(`[DataSource] Unknown data source: ${DATA_SOURCE}, falling back to mock`);
      return getMockOpportunities();
  }
}

/**
 * Get opportunities by stage from the configured data source
 */
export async function getOpportunitiesByStageFromSource(stage: string, scope: DataScope = "team"): Promise<Opportunity[]> {
  const all = await getOpportunitiesFromSource(scope);
  return all.filter((o) => o.stage === stage);
}

/**
 * Get metrics from the configured data source
 */
export async function getMetricsFromSource(scope: DataScope = "team"): Promise<{
  totalLeads: number;
  wonOpportunities: number;
  conversionRate: number;
  weightedPipeline: number;
  wonRevenue: number;
  openOpportunities: number;
  idleOpportunities: number;
}> {
  const all = await getOpportunitiesFromSource(scope);

  const won = all.filter((o) => o.stage === "Won");
  const open = all.filter((o) => o.stage !== "Won");
  const qualified = all.filter((o) => o.stage === "Qualified");

  const totalLeads = all.length;
  const wonOpportunities = won.length;
  const conversionRate = totalLeads > 0 ? Math.round((wonOpportunities / totalLeads) * 100) : 0;
  const weightedPipeline = all.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
  const wonRevenue = won.reduce((sum, o) => sum + (o.amount || 0), 0);
  const openOpportunities = open.length;
  const idleOpportunities = qualified.length;

  return {
    totalLeads,
    wonOpportunities,
    conversionRate,
    weightedPipeline,
    wonRevenue,
    openOpportunities,
    idleOpportunities,
  };
}

// ============================================================================
// Data Source Implementations
// ============================================================================

/**
 * Get mock opportunities (hardcoded test data)
 */
async function getMockOpportunities(): Promise<Opportunity[]> {
  console.log("[DataSource] Fetching from mock data");
  return mockOpportunities;
}

/**
 * Get opportunities from local database
 */
async function getDatabaseOpportunities(): Promise<Opportunity[]> {
  console.log("[DataSource] Fetching from database");
  try {
    return await getAllOpportunities();
  } catch (error) {
    console.error("[DataSource] Database fetch failed, falling back to mock:", error);
    return getMockOpportunities();
  }
}

/**
 * Get opportunities from Odoo (requires valid credentials and database)
 */
async function getOdooOpportunities(scope: DataScope): Promise<Opportunity[]> {
  console.log("[DataSource] Fetching from Odoo");
  try {
    const { getOdooClient } = await import("./odoo");
    const client = await getOdooClient();
    if (!client) {
      console.warn("[DataSource] Odoo client not available, falling back to mock");
      return getMockOpportunities();
    }

    const teamId = ENV.odooTeamId ? Number(ENV.odooTeamId) : undefined;
    const teamName = ENV.odooTeamName || undefined;
    const leadType = ENV.odooLeadType || undefined;
    const userId = ENV.odooUserId ? Number(ENV.odooUserId) : undefined;
    const userName = ENV.odooUserName || undefined;
    const userLogin = ENV.odooUserLogin || undefined;

    let filters: {
      teamId?: number;
      teamName?: string;
      leadType?: string;
      userId?: number;
      userName?: string;
      userLogin?: string;
    } = { leadType };

    if (scope === "team") {
      filters = { ...filters, teamId, teamName };
    } else if (scope === "mine") {
      if (userId || userName || userLogin) {
        filters = { ...filters, userId, userName, userLogin };
      } else if (teamId || teamName) {
        console.warn("[DataSource] My Pipeline requested but no user filter set; falling back to team filter.");
        filters = { ...filters, teamId, teamName };
      }
    }

    const leads = await client.getLeads(200, filters);
    const now = new Date();

    return leads.map((lead, index) => {
      const odooId = Number(lead.id) || index + 1;
      const stage = Array.isArray(lead.stage_id) ? String(lead.stage_id[1]) : "New";
      const probability = Number(lead.probability ?? 0);
      const expectedRevenue = Math.round(Number(lead.expected_revenue ?? 0) * 1000);
      const createdAt = lead.create_date ? new Date(String(lead.create_date)) : now;
      const partnerName = Array.isArray(lead.partner_id) ? String(lead.partner_id[1]) : null;

      return {
        id: odooId,
        odooId,
        name: String(lead.name ?? `Lead #${odooId}`),
        stage,
        amount: expectedRevenue,
        probability,
        expectedRevenue,
        partnerName,
        email: lead.email_from ? String(lead.email_from) : null,
        phone: lead.phone ? String(lead.phone) : null,
        description: lead.description ? String(lead.description) : null,
        rating: 0,
        createdAt,
        updatedAt: createdAt,
        syncedAt: now,
      } satisfies Opportunity;
    });
  } catch (error) {
    console.error("[DataSource] Odoo fetch failed, falling back to mock:", error);
    return getMockOpportunities();
  }
}
