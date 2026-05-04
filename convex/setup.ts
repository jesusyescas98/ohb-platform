import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateProfile = mutation({
  args: {
    sessionId: v.string(),
    name: v.optional(v.string()),
    budget: v.optional(v.number()),
    interest: v.optional(v.string()),
    location: v.optional(v.string()),
    score: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("prospect_profiles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        budget: args.budget ?? existing.budget,
        interest: args.interest ?? existing.interest,
        location: args.location ?? existing.location,
        score: args.score ?? existing.score,
        status: (args.score || existing.score || 0) >= 3 ? "qualified" : "new",
      });
    } else {
      await ctx.db.insert("prospect_profiles", {
        sessionId: args.sessionId,
        name: args.name,
        budget: args.budget,
        interest: args.interest,
        location: args.location,
        score: args.score,
        status: (args.score || 0) >= 3 ? "qualified" : "new",
      });
    }
    return null;
  },
});

export const seedInventory = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const properties = [
      {
        name: "Casa Moderna Las Lomas",
        address: "Av. Paseo de la Reforma, CDMX",
        price: 15000000,
        description: "Lujosa casa con acabados de mármol y alberca techada.",
        images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"],
        status: "in_office" as const,
        creationDate: Date.now(),
        lat: 19.427,
        lng: -99.201,
      },
      {
        name: "Departamento Sky Polanco",
        address: "Polanco III Secc, CDMX",
        price: 8500000,
        description: "Vista panorámica a toda la ciudad, 3 recámaras.",
        images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa"],
        status: "in_office" as const,
        creationDate: Date.now(),
        lat: 19.432,
        lng: -99.191,
      },
      {
        name: "Residencia Campestre Queretaro",
        address: "Zibatá, Querétaro",
        price: 4200000,
        description: "Ideal para familias, doble seguridad y áreas verdes.",
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811"],
        status: "in_office" as const,
        creationDate: Date.now(),
        lat: 20.655,
        lng: -100.334,
      }
    ];

    for (const p of properties) {
      const existingProp = await ctx.db.query("properties").filter(q => q.eq(q.field("name"), p.name)).first();
      if (existingProp) {
        await ctx.db.patch(existingProp._id, { lat: p.lat, lng: p.lng });
      } else {
        await ctx.db.insert("properties", p);
      }
    }
    return null;
  },
});

export const listProspects = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("prospect_profiles").order("desc").collect();
  },
});

export const assignProspect = mutation({
  args: {
    prospectId: v.id("prospect_profiles"),
    advisorId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prospectId, {
      assignedTo: args.advisorId,
      status: "assigned",
    });
    return null;
  },
});
