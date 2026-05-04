import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { auth } from "./auth";

export const get = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("site_config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return config ? config.value : null;
  },
});

export const listAll = query({
  args: {},
  returns: v.array(v.object({ _id: v.id("site_config"), key: v.string(), value: v.string() })),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user?.role !== "admin") return [];
    return await ctx.db.query("site_config").collect();
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("site_config")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("site_config", { key: args.key, value: args.value });
    }
    return null;
  },
});
