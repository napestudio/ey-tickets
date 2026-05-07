import { revalidatePath } from "next/cache";
import {prisma} from "../prisma";
import { generateVerificationToken } from "../tokens";
import { User, UserType } from "@/types/user";

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function getAllUsersButAdmins() {
  return await prisma.user.findMany({ where: { type: "SELLER" } });
}

export async function getUsersByClientId(clientId: string) {
  return await prisma.user.findMany({
    where: {
      clientId,
    },
    include: {
      configuration: true,
      events: true,
    },
  });
}

export async function getUsersByType(clientId: string, type: UserType) {
  return await prisma.user.findMany({
    where: {
      clientId,
      type,
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findFirstOrThrow({
    where: {
      email,
    },
  });
}

export async function getUserById(userId: string) {
  return await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });
}

export async function updateUser(data: any, email: string) {
  const { id } = await getUserByEmail(email as string);
  return await prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateUserById(data: any, userId: string) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}

export async function getUserByEmailForRegister(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createUser(data: any) {
  const createdUser = await prisma.user.create({ data });
  await prisma.userConfiguration.create({
    data: {
      userId: createdUser.id,
    },
  });
  const verificationToken = await generateVerificationToken(data.email);
  return createdUser;
}

export async function deleteUser(userId: string, userEmail: string) {
  if (!userId) {
    throw new Error("Falta el ID del usuario");
  }

  // Verificar si tiene eventos asignados
  const hasEvents = await prisma.event.findFirst({
    where: {
      userId,
    },
  });

  const hasInvitations = await prisma.invitation.findFirst({
    where: {
      email: userEmail,
    },
  });

  if (hasEvents) {
    return {
      error: "Este usuario tiene eventos asignados y no se puede eliminar",
    };
  }
  if (hasInvitations) {
    await prisma.invitation.delete({
      where: {
        id: hasInvitations.id,
      },
    });
  }

  // Eliminar usuario
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/usuarios");

  return { success: true };
}
