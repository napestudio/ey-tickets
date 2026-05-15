import { UserConfiguration } from "./user-configuration";

export type OrganizationRole = "OWNER" | "ADMIN" | "MANAGER" | "SELLER";

export type AppRole = OrganizationRole | "SUPERADMIN";

export type EventRole = "MANAGER" | "SELLER" | "VALIDATOR" | "VIEWER";

export type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  isSuperAdmin?: boolean;
  createdAt?: Date | null;
  configuration?: UserConfiguration | null;
  producerMember?: { role: OrganizationRole; producerId: string } | null;
  role?: OrganizationRole | null;
};
