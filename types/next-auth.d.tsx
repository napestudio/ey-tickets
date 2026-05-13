import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { OrganizationRole } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      isSuperAdmin: boolean;
      producerId: string | null;
      role: OrganizationRole | null;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    isSuperAdmin: boolean;
    producerId?: string | null;
    role?: OrganizationRole | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    isSuperAdmin: boolean;
    producerId: string | null;
    role: OrganizationRole | null;
  }
}
