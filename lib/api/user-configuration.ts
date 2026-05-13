import { UserConfiguration } from "@/types/user-configuration";
import { prisma } from "../prisma";

export async function getUserConfiguration(userId: string) {
  return await prisma.userConfiguration.findUnique({
    where: { userId },
  });
}

export async function getAllUserConfiguration(userId: string) {
  return await prisma.userConfiguration.findMany({
    where: { userId },
  });
}

export async function createUserConfiguration(userId: string) {
  return await prisma.userConfiguration.create({
    data: { userId },
  });
}

export async function updateUserConfiguration(
  configData: Partial<UserConfiguration>,
  configId: string
) {
  return await prisma.userConfiguration.update({
    data: configData,
    where: { id: configId },
  });
}

export async function getProducerConfiguration(producerId: string) {
  return await prisma.producerConfiguration.findUnique({
    where: { producerId },
  });
}

export async function updateProducerConfiguration(
  producerId: string,
  data: {
    serviceCharge?: number;
    maxValidatorsPerEvent?: number;
    maxInvitesPerEvent?: number;
    maxTicketsPerEvent?: number;
  }
) {
  return await prisma.producerConfiguration.upsert({
    where: { producerId },
    create: { producerId, ...data },
    update: data,
  });
}
