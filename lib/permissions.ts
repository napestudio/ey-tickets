import { AppRole } from "@/types/user";
import {
  can as _can,
  getPermissions,
  Permission,
  JwtUser,
} from "@/lib/route-permissions";

export type { Permission, JwtUser };
export { getPermissions };

/**
 * Chequeo de permiso a nivel de feature.
 * Delega a la config centralizada de route-permissions.
 * Usar en Server Components y Server Actions para controlar UI.
 *
 * Ejemplo:
 *   if (can(session.user, "reports:view")) { ... }
 */
export function can(user: JwtUser, permission: Permission): boolean {
  return _can(user, permission);
}

export function isOrgAdmin(role: AppRole | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function isOrgManager(role: AppRole | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export type SessionUser = {
  id: string;
  producerId: string | null;
  role: AppRole | null;
};

/**
 * Verifica si el usuario puede ver todos los eventos de su productora.
 * OWNER y ADMIN tienen acceso implícito a todos los eventos.
 * SUPERADMIN tiene acceso a todo.
 */
export function hasImplicitEventAccess(user: SessionUser): boolean {
  if (user.role === "SUPERADMIN") return true;
  return isOrgAdmin(user.role);
}

/**
 * Retorna el where de Prisma para filtrar eventos accesibles por el usuario.
 * SUPERADMIN: todos los eventos de todas las productoras.
 * OWNER/ADMIN: todos los eventos de su productora.
 * MANAGER/SELLER: solo eventos donde son EventMember explícito.
 */
export function buildEventAccessFilter(user: SessionUser) {
  if (user.role === "SUPERADMIN") {
    return {}; // Sin filtro: ve todos los eventos de todas las productoras
  }

  if (!user.producerId || !user.role) {
    return { id: "NONE" }; // Sin membresía: no accede a nada
  }

  const base = { producerId: user.producerId };

  if (isOrgAdmin(user.role)) {
    return base; // OWNER/ADMIN: todos los eventos de su productora
  }

  // MANAGER/SELLER: solo eventos donde son miembro explícito
  return {
    ...base,
    members: {
      some: { userId: user.id },
    },
  };
}

/**
 * Verifica que un evento pertenece a la productora del usuario.
 * Útil para server actions que reciben un eventId.
 */
export function assertEventBelongsToProducer(
  eventProducerId: string,
  user: SessionUser
): void {
  if (user.role === "SUPERADMIN") return;
  if (user.producerId !== eventProducerId) {
    throw new Error("No tenés acceso a este evento");
  }
}
