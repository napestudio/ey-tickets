import { OrganizationRole } from "@/types/user";

export function isOrgAdmin(role: OrganizationRole | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function isOrgManager(
  role: OrganizationRole | null | undefined
): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export type SessionUser = {
  id: string;
  isSuperAdmin: boolean;
  producerId: string | null;
  role: OrganizationRole | null;
};

/**
 * Verifica si el usuario puede ver todos los eventos de su productora.
 * OWNER y ADMIN tienen acceso implícito a todos los eventos.
 * SUPERADMIN tiene acceso a todo.
 */
export function hasImplicitEventAccess(user: SessionUser): boolean {
  if (user.isSuperAdmin) return true;
  return isOrgAdmin(user.role);
}

/**
 * Retorna el where de Prisma para filtrar eventos accesibles por el usuario.
 * Para OWNER/ADMIN de productora o SUPERADMIN: todos los eventos de la productora.
 * Para MANAGER/SELLER: solo eventos donde son EventMember.
 */
export function buildEventAccessFilter(user: SessionUser) {
  if (user.isSuperAdmin) {
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
  if (user.isSuperAdmin) return;
  if (user.producerId !== eventProducerId) {
    throw new Error("No tenés acceso a este evento");
  }
}
