import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

import bcrypt from "bcryptjs";

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
      async authorize(credentials: any) {
        const user: any = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const { password, ...props } = user;
        const valid = await bcrypt.compare(credentials.password, password);

        if (!valid) return null;

        return props;
      },
    }),
  ],

  pages: {
    signIn: "/ingresar",
    signOut: "/",
    error: "/ingresar",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: any }) {
      try {
        const { name, email, image } = user;

        const existingUser = await prisma.user.findUnique({
          where: { email: email! },
        });

        // Usuario ya existe: permitir acceso
        if (existingUser) {
          return true;
        }

        // Usuario nuevo: buscar invitación aceptada
        const invitation = await prisma.invitation.findFirst({
          where: { email: email!, accepted: true },
        });

        if (!invitation || !invitation.producerId) {
          return false;
        }

        // Crear el usuario
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            image,
            emailVerified: null,
            isSuperAdmin: false,
          },
        });

        // Crear la membresía en la productora
        await prisma.producerMember.create({
          data: {
            userId: newUser.id,
            producerId: invitation.producerId,
            role: invitation.role,
          },
        });

        // Crear Account para OAuth (Google)
        if (account?.provider === "google") {
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

        // Crear configuración personal del usuario
        await prisma.userConfiguration.create({
          data: { userId: newUser.id },
        });

        return true;
      } catch (error) {
        console.error("Error en signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Cargar datos de membresía en cada renovación de token
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            isSuperAdmin: true,
            emailVerified: true,
            producerMember: {
              select: {
                producerId: true,
                role: true,
                producer: { select: { status: true } },
              },
            },
          },
        });

        if (dbUser) {
          token.producerId = dbUser.producerMember?.producerId ?? null;
          token.producerStatus =
            dbUser.producerMember?.producer?.status ?? null;
          // isSuperAdmin en la DB se mapea a role "SUPERADMIN" en el token
          token.role = dbUser.isSuperAdmin
            ? "SUPERADMIN"
            : (dbUser.producerMember?.role ?? null);
          token.emailVerified = dbUser.emailVerified ?? null;
        } else {
          // El usuario fue eliminado de la DB — invalidar la sesión
          return null as unknown as JWT;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.producerId = token.producerId as string | null;
        session.user.producerStatus = token.producerStatus as string | null;
        session.user.role = token.role;
        session.user.isSuperAdmin = token.role === "SUPERADMIN";
        session.user.emailVerified = token.emailVerified as Date | null;
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
      // UserConfiguration solo si no existe ya
      const existing = await prisma.userConfiguration.findUnique({
        where: { userId: user.id },
      });
      if (!existing) {
        await prisma.userConfiguration.create({
          data: { userId: user.id },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * NOTA:
 * El usuario se crea manualmente en el callback `signIn` para:
 * - Asociarlo a una Productora vía ProducerMember (desde Invitation.producerId)
 * - Asignarle un OrganizationRole (desde Invitation.role)
 * - Crear su Account (OAuth) y UserConfiguration
 *
 * SUPERADMINs (isSuperAdmin: true) no tienen ProducerMember.
 * El JWT incluye: id, isSuperAdmin, producerId, role, emailVerified.
 */
