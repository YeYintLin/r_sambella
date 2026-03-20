/**
 * Odoo API Integration Module
 * Handles authentication and data fetching from Odoo via XML-RPC API
 */

import axios from "axios";
import { ENV } from "./_core/env";

interface OdooAuthResponse {
  uid: number;
}

interface OdooSearchResult {
  [key: string]: unknown;
}

class OdooClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private database: string;
  private uid: number | null = null;

  constructor(
    baseUrl: string,
    username: string,
    password: string,
    database?: string
  ) {
    // Ensure URL doesn't have trailing slash and remove /odoo if present
    let cleanUrl = baseUrl.replace(/\/$/, "");
    if (cleanUrl.endsWith("/odoo")) {
      cleanUrl = cleanUrl.slice(0, -5); // Remove /odoo
    }
    this.baseUrl = cleanUrl;
    this.username = username;
    this.password = password;
    this.database = database || ""; // Will be fetched if not provided
  }

  /**
   * Authenticate with Odoo using JSON-RPC
   */
  async authenticate(): Promise<boolean> {
    try {
      console.log(`[Odoo] Attempting authentication at: ${this.baseUrl}/jsonrpc`);
      
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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[Odoo] Auth response:", JSON.stringify(response.data).substring(0, 200));

      if (response.data.error) {
        console.error("[Odoo Auth Error]", response.data.error);
        return false;
      }

      if (!response.data.result) {
        console.error("[Odoo Auth Error] No UID returned");
        return false;
      }

      this.uid = response.data.result;
      console.log(`[Odoo] Authenticated successfully as UID: ${this.uid}`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Odoo Auth Failed]", errorMsg);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[Odoo Response Status]", error.response.status);
        console.error("[Odoo Response Data]", JSON.stringify(error.response.data).substring(0, 500));
      }
      return false;
    }
  }

  /**
   * Call Odoo RPC method
   */
  private async rpcCall(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
  ): Promise<unknown> {
    if (!this.uid) {
      throw new Error("Not authenticated with Odoo");
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
            kwargs,
          },
          id: 1,
        },
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        console.error(`[Odoo RPC Error] ${model}.${method}:`, response.data.error);
        throw new Error(
          typeof response.data.error === "object"
            ? response.data.error.data?.message || JSON.stringify(response.data.error)
            : String(response.data.error)
        );
      }

      return response.data.result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Odoo RPC Failed] ${model}.${method}:`, errorMsg);
      throw error;
    }
  }

  private async search(model: string, domain: unknown[] = [], limit: number = 1): Promise<number[]> {
    const result = (await this.rpcCall(model, "search", [domain, 0, limit])) as number[];
    return result ?? [];
  }

  async getTeamIdByName(teamName: string): Promise<number | null> {
    if (!teamName) return null;
    try {
      const ids = await this.search("crm.team", [["name", "=", teamName]], 1);
      return ids.length > 0 ? ids[0] : null;
    } catch (error) {
      console.error("[Odoo] Failed to resolve team name:", error);
      return null;
    }
  }

  async getUserIdByName(name: string): Promise<number | null> {
    if (!name) return null;
    try {
      const ids = await this.search("res.users", [["name", "=", name]], 1);
      return ids.length > 0 ? ids[0] : null;
    } catch (error) {
      console.error("[Odoo] Failed to resolve user name:", error);
      return null;
    }
  }

  async getUserIdByLogin(login: string): Promise<number | null> {
    if (!login) return null;
    try {
      const ids = await this.search("res.users", [["login", "=", login]], 1);
      return ids.length > 0 ? ids[0] : null;
    } catch (error) {
      console.error("[Odoo] Failed to resolve user login:", error);
      return null;
    }
  }

  /**
   * Get CRM leads
   */
  async getLeads(
    limit: number = 100,
    options?: {
      teamId?: number;
      teamName?: string;
      leadType?: string;
      userId?: number;
      userName?: string;
      userLogin?: string;
    }
  ): Promise<OdooSearchResult[]> {
    try {
      const domain: unknown[] = [];
      if (options?.leadType) {
        domain.push(["type", "=", options.leadType]);
      }
      if (options?.teamId) {
        domain.push(["team_id", "=", options.teamId]);
      } else if (options?.teamName) {
        const teamId = await this.getTeamIdByName(options.teamName);
        if (teamId) {
          domain.push(["team_id", "=", teamId]);
        } else {
          console.warn(`[Odoo] Team name not found: ${options.teamName}. Fetching all teams.`);
        }
      }
      if (options?.userId) {
        domain.push(["user_id", "=", options.userId]);
      } else if (options?.userName) {
        const userId = await this.getUserIdByName(options.userName);
        if (userId) {
          domain.push(["user_id", "=", userId]);
        } else {
          console.warn(`[Odoo] User name not found: ${options.userName}.`);
        }
      } else if (options?.userLogin) {
        const userId = await this.getUserIdByLogin(options.userLogin);
        if (userId) {
          domain.push(["user_id", "=", userId]);
        } else {
          console.warn(`[Odoo] User login not found: ${options.userLogin}.`);
        }
      }

      const leadIds = (await this.rpcCall("crm.lead", "search", [domain, 0, limit])) as number[];
      if (!leadIds || leadIds.length === 0) return [];

      const leads = (await this.rpcCall("crm.lead", "read", [
        leadIds,
        [
          "id",
          "name",
          "email_from",
          "stage_id",
          "probability",
          "expected_revenue",
          "create_date",
          "partner_id",
          "phone",
          "description",
        ],
      ])) as OdooSearchResult[];

      return leads;
    } catch (error) {
      console.error("[Odoo] Failed to fetch leads:", error);
      return [];
    }
  }

  /**
   * Get sales orders
   */
  async getSalesOrders(limit: number = 100): Promise<OdooSearchResult[]> {
    try {
      const orderIds = (await this.rpcCall("sale.order", "search", [
        [["state", "in", ["sale", "done"]]],
        0,
        limit,
      ])) as number[];

      if (!orderIds || orderIds.length === 0) return [];

      const orders = (await this.rpcCall("sale.order", "read", [
        orderIds,
        ["id", "name", "partner_id", "amount_total", "state", "create_date"],
      ])) as OdooSearchResult[];

      return orders;
    } catch (error) {
      console.error("[Odoo] Failed to fetch sales orders:", error);
      return [];
    }
  }

  /**
   * Get manufacturing orders (if manufacturing module is installed)
   */
  async getManufacturingOrders(limit: number = 100): Promise<OdooSearchResult[]> {
    try {
      const moIds = (await this.rpcCall("mrp.production", "search", [[], 0, limit])) as number[];

      if (!moIds || moIds.length === 0) return [];

      const orders = (await this.rpcCall("mrp.production", "read", [
        moIds,
        ["id", "name", "state", "product_id", "product_qty", "create_date"],
      ])) as OdooSearchResult[];

      return orders;
    } catch (error) {
      console.error("[Odoo] Failed to fetch manufacturing orders:", error);
      return [];
    }
  }

  /**
   * Get inventory data
   */
  async getInventory(limit: number = 100): Promise<OdooSearchResult[]> {
    try {
      const productIds = (await this.rpcCall("product.product", "search", [[], 0, limit])) as number[];

      if (!productIds || productIds.length === 0) return [];

      const products = (await this.rpcCall("product.product", "read", [
        productIds,
        ["id", "name", "qty_available", "virtual_available"],
      ])) as OdooSearchResult[];

      return products;
    } catch (error) {
      console.error("[Odoo] Failed to fetch inventory:", error);
      return [];
    }
  }
}

// Singleton instance
let odooClient: OdooClient | null = null;

/**
 * Get or create Odoo client instance
 */
export async function getOdooClient(): Promise<OdooClient | null> {
  if (!ENV.odooUrl || !ENV.odooUsername || !ENV.odooPassword) {
    console.warn("[Odoo] Missing credentials in environment variables");
    return null;
  }

  if (odooClient) {
    return odooClient;
  }

  odooClient = new OdooClient(
    ENV.odooUrl,
    ENV.odooUsername,
    ENV.odooPassword,
    ENV.odooDatabase
  );

  const authenticated = await odooClient.authenticate();
  if (!authenticated) {
    console.error("[Odoo] Failed to authenticate");
    odooClient = null;
    return null;
  }

  return odooClient;
}

/**
 * Test Odoo connection
 */
export async function testOdooConnection(): Promise<boolean> {
  const client = await getOdooClient();
  return client !== null;
}
