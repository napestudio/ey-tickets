import { Evento } from "./event";
import { UserConfiguration } from "./user-configuration";

export type UserType = "SELLER" | "PRODUCER" | "ADMIN" | "SUPERADMIN";

export type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  mpAccessToken?: string | null;
  password?: string | null;
  type?: UserType;
  createdAt?: Date | null;
  clientId: string | null;
  events?: Partial<Evento[]> | null;
  configuration?: UserConfiguration | null;
};
