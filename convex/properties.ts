import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("properties"),
      _creationTime: v.number(),
      name: v.string(),
      address: v.string(),
      price: v.number(),
      description: v.string(),
      images: v.array(v.string()),
      status: v.union(v.literal("in_office"), v.literal("with_someone")),
      assignedTo: v.optional(v.id("users")),
      creationDate: v.number(),
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("properties").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    price: v.number(),
    description: v.string(),
    images: v.array(v.string()),
    status: v.union(v.literal("in_office"), v.literal("with_someone")),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  returns: v.id("properties"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "sales_rep") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("properties", {
      ...args,
      creationDate: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("properties"),
    status: v.union(v.literal("in_office"), v.literal("with_someone")),
    assignedTo: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.id, {
      status: args.status,
      assignedTo: args.assignedTo,
    });
    return null;
  },
});
