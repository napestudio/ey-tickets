import { ValidatorToken } from "@/types/validators";
import {prisma} from "../prisma";

export async function createValidatorToken(data: ValidatorToken) {
  return await prisma.validatorToken.create({ data });
}

export async function getTokensByEvent(eventId: string) {
  return await prisma.validatorToken.findMany({
    where: {
      eventId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function deleteTokenById(tokenId: string) {
  return await prisma.validatorToken.delete({
    where: {
      id: tokenId,
    },
  });
}

export async function getEventByToken(token: string) {
  return await prisma.validatorToken.findUnique({
    where: {
      token: token,
    },
  });
}
