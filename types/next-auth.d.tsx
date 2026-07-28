import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { AppRole } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      producerId: string | null;
      producerStatus: string | null;
      role: AppRole | null;
      isSuperAdmin: boolean;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    producerId?: string | null;
    role?: AppRole | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    producerId: string | null;
    producerStatus: string | null;
    role: AppRole | null;
  }
}
