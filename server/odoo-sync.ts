/**
 * Odoo Sync Service
 * Fetches CRM opportunities from Odoo and syncs them to local database
 */

import axios from "axios";
import { ENV } from "./_core/env";
import { upsertOpportunity } from "./opportunities.db";

interface OdooOpportunity {
  id: number;
  name: string;
  stage_id: [number, string]; // [id, name]
  amount_total?: number;
  probability?: number;
  expected_revenue?: number;
  partner_id?: [number, string];
  email_from?: string;
  phone?: string;
  description?: string;
  rating?: number;
  create_date?: string;
}

class OdooSyncService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private database: string;
  private uid: number | null = null;

  constructor(
    baseUrl: string,
    username: string,
    password: string,
    database: string
  ) {
    let cleanUrl = baseUrl.replace(/\/$/, "");
    if (cleanUrl.endsWith("/odoo")) {
      cleanUrl = cleanUrl.slice(0, -5);
    }
    this.baseUrl = cleanUrl;
    this.username = username;
    this.password = password;
    this.database = database;
  }

  /**
   * Authenticate with Odoo
   */
  async authenticate(): Promise<boolean> {
    try {
      console.log(`[Odoo Sync] Authenticating at: ${this.baseUrl}/jsonrpc`);

      const response = await axios.post(
        `${this.baseUrl}/jsonrpc`,
        {
          jsonrpc: "2.0",
          method: "call",
          params: {
            service: "common",
            method: "authenticate",
            args: [this.database, this.username, this.password, {}],
          },
          id: 1,
        },
        {
          timeout: 15000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.error || !response.data.result) {
        console.error("[Odoo Sync] Auth failed:", response.data.error);
        return false;
      }

      this.uid = response.data.result;
      console.log(`[Odoo Sync] Authenticated as UID: ${this.uid}`);
      return true;
    } catch (error) {
      console.error("[Odoo Sync] Auth error:", error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Call Odoo RPC method
   */
  private async rpcCall(
    model: string,
    method: string,
    args: unknown[] = []
  ): Promise<unknown> {
    if (!this.uid) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/jsonrpc`,
        {
          jsonrpc: "2.0",
          method: "call",
          params: {
            service: "object",
            method: "execute",
            args: [this.database, this.uid, this.password, model, method, ...args],
          },
          id: 1,
        },
        {
          timeout: 15000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.error) {
        throw new Error(
          typeof response.data.error === "object"
            ? response.data.error.data?.message || JSON.stringify(response.data.error)
            : String(response.data.error)
        );
      }

      return response.data.result;
    } catch (error) {
      console.error(`[Odoo Sync] RPC call failed (${model}.${method}):`, error);
      throw error;
    }
  }

  /**
   * Fetch opportunities from Odoo
   */
  async fetchOpportunities(): Promise<OdooOpportunity[]> {
    try {
      console.log("[Odoo Sync] Fetching opportunities...");

      // Search for all leads/opportunities
      const leadIds = (await this.rpcCall("crm.lead", "search", [[]])) as number[];

      if (!leadIds || leadIds.length === 0) {
        console.log("[Odoo Sync] No opportunities found");
        return [];
      }

      console.log(`[Odoo Sync] Found ${leadIds.length} opportunities`);

      // Read opportunity details
      const opportunities = (await this.rpcCall("crm.lead", "read", [
        leadIds,
        [
          "id",
          "name",
          "stage_id",
          "probability",
          "expected_revenue",
          "partner_id",
          "email_from",
          "phone",
          "description",
          "create_date",
        ],
      ])) as OdooOpportunity[];

      console.log(`[Odoo Sync] Fetched ${opportunities.length} opportunities from Odoo`);

      return opportunities;
    } catch (error) {
      console.error("[Odoo Sync] Failed to fetch opportunities:", error);
      return [];
    }
  }

  /**
   * Sync opportunities to local database
   */
  async syncOpportunities(): Promise<number> {
    try {
      const opportunities = await this.fetchOpportunities();

      if (opportunities.length === 0) {
        console.log("[Odoo Sync] No opportunities to sync");
        return 0;
      }

      let synced = 0;

      for (const opp of opportunities) {
        try {
          await upsertOpportunity(opp.id, {
            name: opp.name,
            stage: opp.stage_id?.[1] || "New",
            amount: Math.round((opp.amount_total || 0) * 1000), // Store in smallest unit
            probability: opp.probability || 0,
            expectedRevenue: Math.round((opp.expected_revenue || 0) * 1000),
            partnerName: opp.partner_id?.[1] || null,
            email: opp.email_from || null,
            phone: opp.phone || null,
            description: opp.description || null,
            rating: opp.rating || 0,
          });
          synced++;
        } catch (error) {
          console.error(`[Odoo Sync] Failed to sync opportunity ${opp.id}:`, error);
        }
      }

      console.log(`[Odoo Sync] Successfully synced ${synced}/${opportunities.length} opportunities`);
      return synced;
    } catch (error) {
      console.error("[Odoo Sync] Sync failed:", error);
      return 0;
    }
  }
}

// Singleton instance
let syncService: OdooSyncService | null = null;

/**
 * Get or create sync service
 */
export async function getSyncService(): Promise<OdooSyncService | null> {
  if (!ENV.odooUrl || !ENV.odooUsername || !ENV.odooPassword || !ENV.odooDatabase) {
    console.warn("[Odoo Sync] Missing Odoo credentials");
    return null;
  }

  if (syncService) {
    return syncService;
  }

  syncService = new OdooSyncService(
    ENV.odooUrl,
    ENV.odooUsername,
    ENV.odooPassword,
    ENV.odooDatabase
  );

  const authenticated = await syncService.authenticate();
  if (!authenticated) {
    console.error("[Odoo Sync] Failed to authenticate");
    syncService = null;
    return null;
  }

  return syncService;
}

/**
 * Perform full sync
 */
export async function syncOdooData(): Promise<number> {
  const service = await getSyncService();
  if (!service) {
    console.error("[Odoo Sync] Cannot sync: service not available");
    return 0;
  }

  return await service.syncOpportunities();
}
