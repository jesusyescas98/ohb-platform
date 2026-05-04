import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { ensureAdmin } from "./security";

export const viewer = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("sales_rep"), v.literal("prospect"))),
    })
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return user;
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("sales_rep"), v.literal("prospect")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
    return null;
  },
});

export const listAll = query({
  args: {},
  returns: v.array(v.any()), // Simplified for now
  handler: async (ctx) => {
    await ensureAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});
