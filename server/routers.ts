import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getOpportunitiesFromSource, getOpportunitiesByStageFromSource, getMetricsFromSource, type DataScope } from "./opportunities-datasource";
import { syncOdooData } from "./odoo-sync";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  crm: router({
    opportunities: router({
      list: publicProcedure
        .input(z.object({ scope: z.enum(["all", "team", "mine"]).optional() }).optional())
        .query(async ({ input }) => {
          const scope = (input?.scope ?? "team") as DataScope;
          return await getOpportunitiesFromSource(scope);
        }),
      byStage: publicProcedure
        .input(z.object({ stage: z.string(), scope: z.enum(["all", "team", "mine"]).optional() }))
        .query(async ({ input }) => {
          const scope = (input.scope ?? "team") as DataScope;
          return await getOpportunitiesByStageFromSource(input.stage, scope);
        }),
      metrics: publicProcedure
        .input(z.object({ scope: z.enum(["all", "team", "mine"]).optional() }).optional())
        .query(async ({ input }) => {
          const scope = (input?.scope ?? "team") as DataScope;
          return await getMetricsFromSource(scope);
        }),
      sync: publicProcedure.mutation(async () => {
        const synced = await syncOdooData();
        return { success: true, synced };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
