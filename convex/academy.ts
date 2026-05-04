import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// List all courses (Admin & Public)
export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("academy_courses").collect();
  },
});

// Admin: Create Course
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    instructor: v.string(),
    duration: v.string(),
    status: v.union(v.literal("active"), v.literal("draft")),
    modules: v.array(v.object({
      title: v.string(),
      content: v.string(),
      type: v.union(v.literal("video"), v.literal("pdf")),
    })),
  },
  returns: v.id("academy_courses"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user?.role !== "admin") throw new Error("Unauthorized");
    return await ctx.db.insert("academy_courses", args);
  },
});

// Admin: Delete Course
export const remove = mutation({
  args: { id: v.id("academy_courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return null;
  },
});

// User: Enroll after payment
export const enroll = mutation({
  args: { courseId: v.id("academy_courses"), paymentId: v.string() },
  returns: v.id("user_enrollments"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("user_enrollments", {
      userId,
      courseId: args.courseId,
      status: "paid",
      progress: 0,
      paymentId: args.paymentId,
    });
  },
});

// User: Complete course and get certificate
export const complete = mutation({
  args: { enrollmentId: v.id("user_enrollments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    
    await ctx.db.patch(args.enrollmentId, {
      status: "completed",
      progress: 100,
      completedAt: Date.now(),
      certificateUrl: `https://ohb-academy.com/cert/${args.enrollmentId}`,
    });
    return null;
  },
});
