import { revalidatePath } from "next/cache";
import {prisma} from "../prisma";

interface AssignPaymentMethodsInput {
  eventId: string;
  paymentMethodIds: string[];
}

export async function createPaymentMethod(data: any) {
  return await prisma.paymentMethod.create({ data });
}
export async function updatePaymentMethod(data: any, paymentMethodId: string) {
  return await prisma.paymentMethod.update({
    where: {
      id: paymentMethodId,
    },
    data,
  });
}

export async function getPaymentMethodsByClientId(clientId: string) {
  return await prisma.paymentMethod.findMany({
    where: {
      clientId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
export async function getPaymentMethodsByCreatorId(creatorId: string) {
  return await prisma.paymentMethod.findMany({
    where: {
      creatorId,
    },
  });
}

export async function assignPaymentMethodsToEvent({
  eventId,
  paymentMethodIds,
}: AssignPaymentMethodsInput) {
  if (!eventId || paymentMethodIds.length === 0) {
    throw new Error("Faltan datos para asociar métodos de pago");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Evento no encontrado");
  }

  // Buscar métodos de pago por ID
  const methods = await prisma.paymentMethod.findMany({
    where: { id: { in: paymentMethodIds } },
  });

  if (methods.length !== paymentMethodIds.length) {
    throw new Error("Algunos métodos de pago no existen");
  }

  // Obtener los ya asignados
  const existingLinks = await prisma.eventPayment.findMany({
    where: { eventId },
    select: { paymentMethodId: true },
  });

  const existingIds = new Set(existingLinks.map((e) => e.paymentMethodId));

  // 🔎 Filtrar solo los nuevos
  const newMethods = methods.filter((m) => !existingIds.has(m.id));

  // ⚠️ Verificar si ya hay un DIGITAL asignado
  const existingDigital = await prisma.eventPayment.findFirst({
    where: {
      eventId,
      paymentMethod: { type: "DIGITAL" },
    },
  });

  const newDigitalCount = newMethods.filter((m) => m.type === "DIGITAL").length;

  if (existingDigital && newDigitalCount > 0) {
    throw new Error("Ya hay un método DIGITAL asignado a este evento");
  }

  if (!existingDigital && newDigitalCount > 1) {
    throw new Error(
      "Solo se puede asignar un método de pago DIGITAL por evento"
    );
  }

  // Crear las nuevas relaciones
  await prisma.eventPayment.createMany({
    data: newMethods.map((m) => ({
      eventId,
      paymentMethodId: m.id,
    })),
  });

  revalidatePath(`/dashboard/events/${eventId}`);

  return { success: true };
}

type UnassignInput = {
  eventId: string;
  paymentMethodId: string;
};

export async function unassignPaymentMethodFromEvent({
  eventId,
  paymentMethodId,
}: UnassignInput) {
  if (!eventId || !paymentMethodId) {
    throw new Error("Faltan datos para desasignar el método de pago");
  }

  const existing = await prisma.eventPayment.findFirst({
    where: {
      eventId,
      paymentMethodId,
    },
  });

  if (!existing) {
    throw new Error("La relación evento - método de pago no existe");
  }

  await prisma.eventPayment.delete({
    where: {
      id: existing.id,
    },
  });

  revalidatePath(`/dashboard/events/${eventId}`);

  return { success: true };
}

export async function getDigitalPaymentMethodByEvent(eventId: string) {
  return await prisma.eventPayment.findMany({
    where: {
      eventId,
      paymentMethod: { type: "DIGITAL" },
    },
    include: {
      paymentMethod: {
        select: {
          apiKey: true,
        },
      },
    },
  });
}

export async function deletePaymentMethodAction(paymentMethodId: string) {
  if (!paymentMethodId) {
    throw new Error("Falta el ID del método de pago");
  }

  // Verificar si está asociado a algún evento
  const linkedToEvent = await prisma.eventPayment.findFirst({
    where: { paymentMethodId },
  });

  if (linkedToEvent) {
    return {
      error:
        "No se puede eliminar: el método está asignado a uno o más eventos",
    };
  }

  await prisma.paymentMethod.delete({
    where: { id: paymentMethodId },
  });

  revalidatePath("/dashboard/payment-methods");

  return { success: true };
}
