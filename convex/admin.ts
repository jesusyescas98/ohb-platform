import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const deleteProperty = mutation({
  args: { id: v.id("properties") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const updateProperty = mutation({
  args: {
    id: v.id("properties"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("in_office"), v.literal("with_someone"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return null;
  },
});

export const addProspectNote = mutation({
  args: {
    prospectId: v.id("prospect_profiles"),
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.prospectId);
    if (!existing) throw new Error("Prospect not found");
    const notes = [...(existing.interest ? [existing.interest] : []), `[NOTE ${new Date().toLocaleDateString()}]: ${args.note}`];
    await ctx.db.patch(args.prospectId, { interest: notes.join(" | ") });
    return null;
  },
});

export const listAllProfiles = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("prospect_profiles").order("desc").collect();
  },
});

export const deleteProfile = mutation({
  args: { id: v.id("prospect_profiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
