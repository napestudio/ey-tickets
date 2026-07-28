import { prisma } from "@/lib/prisma";
import { Prisma, TicketPackageStatus } from "@prisma/client";
import {
  AdjustProducerStockInput,
  AdjustProducerStockResult,
  CreateTicketPackageInput,
  TicketPackageSummary,
} from "@/types/superadmin";
import { getProducerStockSummary } from "@/lib/api/ticket-stock";

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

export async function adjustProducerStock(
  producerId: string,
  input: AdjustProducerStockInput
): Promise<AdjustProducerStockResult> {
  const { action, quantity, reason } = input;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw Object.assign(
      new Error("La cantidad debe ser un entero positivo"),
      { status: 400 }
    );
  }

  const summary = await getProducerStockSummary(producerId);
  const currentPool = summary.totalPool;
  const committed = summary.usedByTicketTypes + summary.allocatedToMembers;

  let delta: number;
  if (action === "add") {
    delta = quantity;
  } else if (action === "remove") {
    delta = -quantity;
  } else {
    // "set"
    delta = quantity - currentPool;
  }

  const newPool = currentPool + delta;

  if (newPool < 0) {
    throw Object.assign(
      new Error(
        `No se puede reducir el pool a un valor negativo. Pool actual: ${currentPool}.`
      ),
      { status: 422 }
    );
  }

  if (newPool < committed) {
    throw Object.assign(
      new Error(
        `No se puede reducir el pool por debajo del stock comprometido. Comprometido: ${committed}, nuevo pool solicitado: ${newPool}.`
      ),
      { status: 422 }
    );
  }

  if (delta === 0) {
    return { previousPool: currentPool, newPool: currentPool, delta: 0, packageId: "" };
  }

  const noteParts = [
    "Ajuste administrativo superadmin",
    delta > 0 ? `+${delta}` : `${delta}`,
  ];
  if (reason) noteParts.push(`| Motivo: ${reason}`);
  const noteText = noteParts.join(" ");

  const pkg = await prisma.ticketPackage.create({
    data: {
      producerId,
      quantity: delta,
      unitPrice: new Prisma.Decimal(0),
      totalPrice: new Prisma.Decimal(0),
      status: "ACTIVE",
      paymentStatus: "PAID",
      notes: noteText,
    },
    select: { id: true },
  });

  return { previousPool: currentPool, newPool, delta, packageId: pkg.id };
}
