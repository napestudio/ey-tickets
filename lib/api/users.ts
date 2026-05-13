import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { generateVerificationToken } from "../tokens";
import { OrganizationRole } from "@prisma/client";

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function getUsersByProducerId(producerId: string) {
  return await prisma.user.findMany({
    where: {
      producerMember: { producerId },
    },
    include: {
      configuration: true,
      producerMember: true,
    },
  });
}

export async function getUsersByProducerAndRole(
  producerId: string,
  role: string
) {
  return await prisma.user.findMany({
    where: {
      producerMember: { producerId, role: role as any },
    },
    include: { producerMember: true },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findFirstOrThrow({
    where: { email },
  });
}

export async function getUserById(userId: string) {
  return await prisma.user.findFirstOrThrow({
    where: { id: userId },
    include: { producerMember: true },
  });
}

export async function updateUser(data: Record<string, unknown>, email: string) {
  const { id } = await getUserByEmail(email);
  return await prisma.user.update({
    where: { id },
    data,
  });
}

export async function updateUserById(
  data: Record<string, unknown>,
  userId: string
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserRole(userId: string, role: OrganizationRole) {
  return await prisma.producerMember.update({
    where: { userId },
    data: { role },
  });
}

export async function getUserByEmailForRegister(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: Record<string, unknown>) {
  const createdUser = await prisma.user.create({ data: data as any });
  await prisma.userConfiguration.create({
    data: { userId: createdUser.id },
  });
  await generateVerificationToken(data.email as string);
  return createdUser;
}

export async function deleteUser(userId: string, userEmail: string) {
  if (!userId) {
    throw new Error("Falta el ID del usuario");
  }

  const hasInvitations = await prisma.invitation.findFirst({
    where: { email: userEmail },
  });

  if (hasInvitations) {
    await prisma.invitation.delete({
      where: { id: hasInvitations.id },
    });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/usuarios");

  return { success: true };
}
