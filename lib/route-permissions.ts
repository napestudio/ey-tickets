import { AppRole } from "@/types/user";

// ─── 1. Named permissions ──────────────────────────────────────────────────────

export type Permission =
  | "dashboard:view"
  | "events:view"
  | "events:create"
  | "events:edit"
  | "events:sell"
  | "events:validators"
  | "users:view"
  | "ticket-stock:view"
  | "payment-methods:view"
  | "reports:view"
  | "discount-codes:view"
  | "promotions:view"
  | "settings:view"
  | "settings:producer"
  | "settings:mercadopago";

// ─── 2. Role → permission set ──────────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  "dashboard:view",
  "events:view",
  "events:create",
  "events:edit",
  "events:sell",
  "events:validators",
  "users:view",
  "ticket-stock:view",
  "payment-methods:view",
  "reports:view",
  "discount-codes:view",
  "promotions:view",
  "settings:view",
  "settings:producer",
  "settings:mercadopago",
];

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPERADMIN: ALL_PERMISSIONS,
  OWNER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS,
  MANAGER: [
    "dashboard:view",
    "events:view",
    "events:create",
    "events:edit",
    "events:sell",
    "events:validators",
    "reports:view",
    "settings:view",
  ],
  SELLER: [
    "dashboard:view",
    "events:view",
    "events:sell",
    "settings:view",
  ],
};

// ─── 3. Route → required permission ───────────────────────────────────────────
//
// El array se evalúa en orden — el primer match gana.
// Los patrones específicos deben ir antes que los genéricos.

export interface RouteRule {
  pattern: RegExp;
  requires: Permission;
}

export const DASHBOARD_ROUTE_RULES: RouteRule[] = [
  // Configuración — sub-rutas antes que la raíz
  { pattern: /^\/dashboard\/configuracion\/productora(\/.*)?$/, requires: "settings:producer" },
  { pattern: /^\/dashboard\/configuracion\/mercado-pago(\/.*)?$/, requires: "settings:mercadopago" },
  { pattern: /^\/dashboard\/configuracion(\/.*)?$/, requires: "settings:view" },
  // Nuevo evento
  { pattern: /^\/dashboard\/nuevo-evento$/, requires: "events:create" },
  // Sub-rutas de evento — específicas antes que la raíz del evento
  { pattern: /^\/dashboard\/evento\/[^/]+\/edit(\/.*)?$/, requires: "events:edit" },
  { pattern: /^\/dashboard\/evento\/[^/]+\/vender-entrada(\/.*)?$/, requires: "events:sell" },
  { pattern: /^\/dashboard\/evento\/[^/]+\/validadores(\/.*)?$/, requires: "events:validators" },
  { pattern: /^\/dashboard\/evento(\/.*)?$/, requires: "events:view" },
  // Listado de eventos
  { pattern: /^\/dashboard\/eventos(\/.*)?$/, requires: "events:view" },
  // Secciones de gestión
  { pattern: /^\/dashboard\/usuarios(\/.*)?$/, requires: "users:view" },
  { pattern: /^\/dashboard\/ticket-stock(\/.*)?$/, requires: "ticket-stock:view" },
  { pattern: /^\/dashboard\/metodos-de-pago(\/.*)?$/, requires: "payment-methods:view" },
  { pattern: /^\/dashboard\/reportes(\/.*)?$/, requires: "reports:view" },
  { pattern: /^\/dashboard\/codigos(\/.*)?$/, requires: "discount-codes:view" },
  { pattern: /^\/dashboard\/nuevo-codigo(\/.*)?$/, requires: "discount-codes:view" },
  { pattern: /^\/dashboard\/promociones(\/.*)?$/, requires: "promotions:view" },
  // Catch-all: /dashboard y cualquier sub-ruta no listada arriba
  { pattern: /^\/dashboard(\/.*)?$/, requires: "dashboard:view" },
];

// ─── 4. Tipo mínimo disponible desde el JWT (sin acceso a DB) ─────────────────

export interface JwtUser {
  role: AppRole | null;
}

// ─── 5. Helpers ────────────────────────────────────────────────────────────────

/** Retorna true si el usuario tiene el permiso dado */
export function can(user: JwtUser, permission: Permission): boolean {
  if (!user.role) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

/**
 * Retorna el permiso requerido para un pathname dado, o null si la ruta
 * no está en el conjunto protegido (es pública).
 */
export function getRequiredPermission(pathname: string): Permission | null {
  for (const rule of DASHBOARD_ROUTE_RULES) {
    if (rule.pattern.test(pathname)) return rule.requires;
  }
  return null;
}

/**
 * Retorna true si el usuario puede acceder al pathname dado.
 * Un pathname que no está cubierto por ninguna regla siempre es accesible.
 */
export function canAccessRoute(user: JwtUser, pathname: string): boolean {
  const required = getRequiredPermission(pathname);
  if (required === null) return true;
  return can(user, required);
}

/**
 * Retorna el conjunto de permisos del usuario.
 * Útil para derivar la navegación y chequeos de UI a nivel de feature.
 */
export function getPermissions(user: JwtUser): Set<Permission> {
  if (!user.role) return new Set();
  return new Set(ROLE_PERMISSIONS[user.role] ?? []);
}
