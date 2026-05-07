import { UserConfiguration } from "@/types/user-configuration";
import {prisma} from "../prisma";

export async function getAllUserConfiguration(userId: string) {
  return await prisma.userConfiguration.findMany({
    where: {
      userId: userId,
    },
  });
}

export async function createUserConfiguration(userId: string) {
  const data = {
    userId,
  };
  return await prisma.userConfiguration.create({ data });
}

export async function updateUserConfiguration(
  configData: Partial<UserConfiguration>,
  configId: string
) {
  return await prisma.userConfiguration.update({
    data: configData,
    where: {
      id: configId,
    },
  });
}
