import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});

export const getHistory = query({
  args: { sessionId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      sessionId: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant")),
      text: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Verificamos si la tabla existe o si hay mensajes
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(10);
    
    return [...messages].reverse();
  },
});
