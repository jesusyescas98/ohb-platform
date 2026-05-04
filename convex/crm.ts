import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { ensureStaff } from "./security";

/**
 * Lists CRM events for a specific prospect (Staff only).
 */
export const listEvents = query({
  args: { prospectId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    await ensureStaff(ctx);
    return await ctx.db
      .query("crm_events")
      .withIndex("by_prospect", (q) => q.eq("prospectId", args.prospectId))
      .order("desc")
      .collect();
  },
});

/**
 * Creates a new CRM event (Staff only).
 */
export const createEvent = mutation({
  args: {
    prospectId: v.id("users"),
    type: v.string(),
    description: v.string(),
    scheduledAt: v.number(),
  },
  returns: v.id("crm_events"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ensureStaff(ctx);

    return await ctx.db.insert("crm_events", {
      ...args,
      salesRepId: userId,
      status: "pending",
    });
  },
});

/**
 * Automated CRM Hook: Called when a new user is created or first interacts.
 */
export const autoOnboard = mutation({
  args: { prospectId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if they already have an onboarding event
    const existing = await ctx.db
      .query("crm_events")
      .withIndex("by_prospect", (q) => q.eq("prospectId", args.prospectId))
      .first();

    if (!existing) {
      // Find an available sales rep (simplified: find first admin or sales_rep)
      const staff = await ctx.db.query("users").collect();
      const rep = staff.find(u => u.role === "sales_rep" || u.role === "admin");

      if (rep) {
        await ctx.db.insert("crm_events", {
          prospectId: args.prospectId,
          salesRepId: rep._id,
          type: "Llamada Inicial",
          status: "pending",
          description: "Nuevo prospecto registrado. Realizar presentación de OHB.",
          scheduledAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours later
        });
      }
    }
    return null;
  },
});
