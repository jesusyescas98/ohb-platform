import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // We extend the users table conceptually by adding fields to it
  // Convex Auth will use the 'users' table.
  // We'll add 'role' to it.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
    role: v.optional(v.union(v.literal("admin"), v.literal("sales_rep"), v.literal("prospect"))),
  }).index("email", ["email"]),

  properties: defineTable({
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
  }),

  files: defineTable({
    name: v.string(),
    fileType: v.string(), // pdf, docx, xlsx, etc.
    storageId: v.id("_storage"),
    propertyId: v.optional(v.id("properties")),
    uploadedBy: v.id("users"),
  }),

  crm_events: defineTable({
    prospectId: v.id("users"),
    salesRepId: v.id("users"),
    type: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    description: v.string(),
    scheduledAt: v.number(),
  }).index("by_prospect", ["prospectId"]),

  academy_courses: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    instructor: v.string(),
    duration: v.string(),
    status: v.union(v.literal("active"), v.literal("draft")),
    modules: v.array(v.object({
      title: v.string(),
      content: v.string(),
      type: v.union(v.literal("video"), v.literal("pdf")),
    })),
  }),

  user_enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("academy_courses"),
    status: v.union(v.literal("paid"), v.literal("completed")),
    progress: v.number(), // 0-100
    paymentId: v.optional(v.string()),
    certificateUrl: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_course", ["courseId"]),

  site_config: defineTable({
    key: v.string(), // "whatsapp", "stripe_public", "stripe_secret", "billing_email"
    value: v.string(),
  }).index("by_key", ["key"]),

  prospect_profiles: defineTable({
    sessionId: v.string(),
    name: v.optional(v.string()),
    budget: v.optional(v.number()),
    interest: v.optional(v.string()),
    location: v.optional(v.string()),
    score: v.optional(v.number()), // 1-5 qualification
    status: v.union(v.literal("new"), v.literal("qualified"), v.literal("assigned")),
    assignedTo: v.optional(v.id("users")),
    notes: v.optional(v.array(v.object({
      text: v.string(),
      timestamp: v.number(),
      author: v.optional(v.string()),
    }))),
  }).index("by_session", ["sessionId"]),

  messages: defineTable({
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
  }).index("by_session", ["sessionId"]),

  counters: defineTable({
    name: v.string(),
    count: v.number(),
  }).index("by_name", ["name"]),
});
