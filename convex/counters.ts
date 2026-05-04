import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { name: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    return counter?.count ?? 0;
  },
});

export const increment = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("counters", { name: args.name, count: 1 });
    }
    return null;
  },
});
