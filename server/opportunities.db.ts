/**
 * Database helpers for CRM opportunities
 */

import { eq } from "drizzle-orm";
import { opportunities, type InsertOpportunity, type Opportunity } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all opportunities
 */
export async function getAllOpportunities(): Promise<Opportunity[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(opportunities);
  } catch (error) {
    console.error("[DB] Failed to get opportunities:", error);
    return [];
  }
}

/**
 * Get opportunities by stage
 */
export async function getOpportunitiesByStage(stage: string): Promise<Opportunity[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(opportunities).where(eq(opportunities.stage, stage));
  } catch (error) {
    console.error("[DB] Failed to get opportunities by stage:", error);
    return [];
  }
}

/**
 * Get opportunity by Odoo ID
 */
export async function getOpportunityByOdooId(odooId: number): Promise<Opportunity | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.odooId, odooId))
      .limit(1);
    return result[0];
  } catch (error) {
    console.error("[DB] Failed to get opportunity by Odoo ID:", error);
    return undefined;
  }
}

/**
 * Create or update opportunity
 */
export async function upsertOpportunity(
  odooId: number,
  data: Omit<InsertOpportunity, "odooId">
): Promise<Opportunity | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const existing = await getOpportunityByOdooId(odooId);

    if (existing) {
      // Update existing
      await db
        .update(opportunities)
        .set({
          ...data,
          updatedAt: new Date(),
          syncedAt: new Date(),
        })
        .where(eq(opportunities.odooId, odooId));

      return await getOpportunityByOdooId(odooId);
    } else {
      // Insert new
      await db.insert(opportunities).values({
        odooId,
        ...data,
      } as InsertOpportunity);

      return await getOpportunityByOdooId(odooId);
    }
  } catch (error) {
    console.error("[DB] Failed to upsert opportunity:", error);
    return undefined;
  }
}

/**
 * Delete opportunity by Odoo ID
 */
export async function deleteOpportunityByOdooId(odooId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(opportunities).where(eq(opportunities.odooId, odooId));
    return true;
  } catch (error) {
    console.error("[DB] Failed to delete opportunity:", error);
    return false;
  }
}

/**
 * Get KPI metrics from opportunities
 */
export async function getOpportunitiesMetrics(): Promise<{
  totalLeads: number;
  wonOpportunities: number;
  conversionRate: number;
  weightedPipeline: number;
  wonRevenue: number;
  openOpportunities: number;
  idleOpportunities: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalLeads: 0,
      wonOpportunities: 0,
      conversionRate: 0,
      weightedPipeline: 0,
      wonRevenue: 0,
      openOpportunities: 0,
      idleOpportunities: 0,
    };
  }

  try {
    const allOpps = await getAllOpportunities();

    const won = allOpps.filter((o) => o.stage === "Won");
    const open = allOpps.filter((o) => o.stage !== "Won");
    const qualified = allOpps.filter((o) => o.stage === "Qualified");

    const totalLeads = allOpps.length;
    const wonOpportunities = won.length;
    const conversionRate = totalLeads > 0 ? Math.round((wonOpportunities / totalLeads) * 100) : 0;
    const weightedPipeline = allOpps.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
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
  } catch (error) {
    console.error("[DB] Failed to get opportunities metrics:", error);
    return {
      totalLeads: 0,
      wonOpportunities: 0,
      conversionRate: 0,
      weightedPipeline: 0,
      wonRevenue: 0,
      openOpportunities: 0,
      idleOpportunities: 0,
    };
  }
}
