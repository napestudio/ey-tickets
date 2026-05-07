import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      type: string;
      name: string;
      email: string;
      lastName: string;
      image?: string;
      clientId?: string;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    id: string;
    lastName: string;
    email: string;
    type: string;
    clientId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: string;
  }
}
