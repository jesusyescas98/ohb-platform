/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as academy from "../academy.js";
import type * as admin from "../admin.js";
import type * as agent from "../agent.js";
import type * as agent_actions from "../agent_actions.js";
import type * as auth from "../auth.js";
import type * as counters from "../counters.js";
import type * as crm from "../crm.js";
import type * as http from "../http.js";
import type * as properties from "../properties.js";
import type * as security from "../security.js";
import type * as setup from "../setup.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  academy: typeof academy;
  admin: typeof admin;
  agent: typeof agent;
  agent_actions: typeof agent_actions;
  auth: typeof auth;
  counters: typeof counters;
  crm: typeof crm;
  http: typeof http;
  properties: typeof properties;
  security: typeof security;
  setup: typeof setup;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
