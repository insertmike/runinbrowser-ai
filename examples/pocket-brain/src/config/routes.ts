/**
 * Centralized route configuration
 * Single source of truth for all application routes
 */

export const RoutePath = {
  HOME: "/",
  CHAT: "/chat",
} as const;

export type RoutePathType = (typeof RoutePath)[keyof typeof RoutePath];
