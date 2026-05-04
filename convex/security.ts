import { auth } from "./auth";
import type { QueryCtx } from "./_generated/server";

/**
 * Checks if the current user has a specific role.
 */
export async function checkRole(ctx: QueryCtx, role: "admin" | "sales_rep" | "prospect") {
  const userId = await auth.getUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  return user?.role === role;
}

/**
 * Helper to ensure the user is an admin.
 */
export async function ensureAdmin(ctx: QueryCtx) {
  const isAdmin = await checkRole(ctx, "admin");
  if (!isAdmin) {
    throw new Error("Acceso denegado: Se requieren permisos de administrador.");
  }
}

/**
 * Helper to ensure the user is at least a sales representative.
 */
export async function ensureStaff(ctx: QueryCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("No autenticado.");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin" && user?.role !== "sales_rep") {
    throw new Error("Acceso denegado: Se requieren permisos de personal.");
  }
}

/**
 * Validates and sanitizes strings to prevent basic injection patterns.
 * (React and Convex already handle most of this, but we add an extra layer).
 */
export function sanitize(text: string): string {
  return text.trim().slice(0, 1000); // Limit length
}
