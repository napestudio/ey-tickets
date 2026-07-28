import { prisma } from "@/lib/prisma";
import { TicketPackageStatus } from "@prisma/client";
import {
  CreateTicketPackageInput,
  TicketPackageSummary,
} from "@/types/superadmin";

export async function getTicketPackages(
  producerId: string
): Promise<TicketPackageSummary[]> {
  const packages = await prisma.ticketPackage.findMany({
    where: { producerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      producerId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      purchasedAt: true,
      expiresAt: true,
      notes: true,
      createdAt: true,
    },
  });

  return packages.map((p) => ({
    ...p,
    unitPrice: p.unitPrice.toNumber(),
    totalPrice: p.totalPrice.toNumber(),
  }));
}

export async function createTicketPackage(
  producerId: string,
  data: CreateTicketPackageInput
): Promise<TicketPackageSummary> {
  const pkg = await prisma.ticketPackage.create({
    data: {
      producerId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      notes: data.notes ?? null,
    },
    select: {
      id: true,
      producerId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      purchasedAt: true,
      expiresAt: true,
      notes: true,
      createdAt: true,
    },
  });

  return {
    ...pkg,
    unitPrice: pkg.unitPrice.toNumber(),
    totalPrice: pkg.totalPrice.toNumber(),
  };
}

export async function cancelTicketPackage(
  producerId: string,
  packageId: string
): Promise<TicketPackageSummary | null> {
  const existing = await prisma.ticketPackage.findFirst({
    where: { id: packageId, producerId },
  });

  if (!existing) return null;

  const pkg = await prisma.ticketPackage.update({
    where: { id: packageId },
    data: { status: TicketPackageStatus.CANCELED },
    select: {
      id: true,
      producerId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      purchasedAt: true,
      expiresAt: true,
      notes: true,
      createdAt: true,
    },
  });

  return {
    ...pkg,
    unitPrice: pkg.unitPrice.toNumber(),
    totalPrice: pkg.totalPrice.toNumber(),
  };
}


