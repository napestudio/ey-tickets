import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, User } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import {prisma} from "@/lib/prisma";

import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "E-mail" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req) {
        // Add logic here to look up the user from the credentials supplied
        const user: any = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }
        // Any object returned will be saved in `user` property of the JWT
        const { password, validatedPassword, ...props } = user;
        const valid = await bcrypt.compare(credentials.password, password);

        if (!valid) {
          return null;
        }

        return props;
      },
    }),
  ],

  pages: {
    signIn: "/ingresar",
    signOut: "/",
    error: "/ingresar", //TODO
    //verifyRequest: "/auth/verify-request", // (used for check email message)
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: any }) {
      try {
        const { name, email, image } = user;

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        // Si el usuario ya existe, permitimos el acceso
        if (existingUser) {
          return true;
        }

        // Si no existe, buscamos una invitación válida
        const invitation = await prisma.invitation.findFirst({
          where: {
            email,
            accepted: true, // aseguramos que esté aceptada previamente
          },
        });

        if (!invitation || !invitation.clientId) {
          return false;
        }

        // Creamos el usuario manualmente
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            image,
            emailVerified: null,
            type: invitation.role,
            client: {
              connect: {
                id: invitation.clientId,
              },
            },
          },
        });

        // Si el proveedor es Google, también creamos el Account asociado
        if (account.provider === "google") {
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              id_token: account.id_token,
              scope: account.scope,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              session_state: account.session_state,
            },
          });
        }
        await prisma.userConfiguration.create({
          data: {
            userId: newUser.id,
          },
        });

        return true;
      } catch (error) {
        console.error("Error en signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user?.id;
        token.role = user?.type;
        token.clientId = user?.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.type = token.role as string;
        session.user.id = token.id as string;
        session.user.clientId = (token.clientId as string) || "0";
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      await prisma.userConfiguration.create({
        data: {
          userId: user.id,
        },
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * NOTA IMPORTANTE:
 * Estamos creando el usuario manualmente en el callback `signIn`
 * porque necesitamos asociarlo a un Client proveniente de la tabla `Invitation`.
 * Esto implica que también debemos crear manualmente:
 * - el `Account` (para evitar OAuthAccountNotLinked)
 * - la `UserConfiguration`
 *
 * Ver más en /docs/auth.md
 */
