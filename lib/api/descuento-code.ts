import { DiscountCode } from "@/types/discount-code";
import {prisma} from "../prisma";

export async function getDiscountCodeByUserId(userId: string) {
  return await prisma.discountCode.findMany({
    where: {
      status: {
        not: "DELETED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
  });
}

export async function getAllDiscountCode() {
  return await prisma.discountCode.findMany({
    where: {
      status: {
        not: "DELETED",
      },
    },
  });
}

export async function createDiscountCode(data: DiscountCode) {
  return await prisma.discountCode.create({ data });
}

export async function updateDiscountCode(
  codeId: string,
  codeData: Partial<DiscountCode>
) {
  return await prisma.discountCode.update({
    where: {
      id: codeId,
    },
    data: codeData,
  });
}

export async function getDiscountCodeById(codeId: string) {
  return await prisma.discountCode.findUnique({
    where: {
      id: codeId,
    },
  });
}

export async function getActiveDiscountCodeByString(
  code: string,
  eventId: string
) {
  return await prisma.discountCode.findFirst({
    where: {
      code,
      eventId,
      status: { not: "DELETED" },
    },
  });
}
