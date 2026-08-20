import { TicketOrder } from "@prisma/client";
import { prisma } from "../prisma";

type TicketOrderType = {
  id?: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  base64Qr: string;
  date: Date;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  status: "NOT_VALIDATED" | "VALIDATED";
  isInvitation?: boolean;
};

export async function createTicketOrder(data: TicketOrderType[]) {
  const createdOrders = await prisma.$transaction(
    data.map((order) =>
      prisma.ticketOrder.create({
        data: order,
        include: {
          ticketType: {
            select: {
              title: true,
              quantity: true,
            },
          },
        },
      }),
    ),
  );
  return createdOrders;
}

export async function updateInvitationTicketOrders(
  tickets: Partial<TicketOrder>[]
): Promise<{ id: string }[]> {
  return await prisma.$transaction(
    tickets.map((t) =>
      prisma.ticketOrder.update({
        where: { id: t.id, isInvitation: true },
        data: {
          name: t.name,
          lastName: t.lastName,
          dni: t.dni,
          email: t.email,
        },
        select: { id: true },
      })
    )
  );
}

export async function getOrderTicketsByEvent(eventId: string) {
  return await prisma.ticketOrder.findMany({
    where: {
      eventId: eventId,
      order: {
        status: "PAID",
      },
    },
    orderBy: [
      {
        name: "asc",
      },
      { createdAt: "desc" },
    ],
    include: {
      order: {
        select: {
          ticketTypeId: true,
          quantity: true,
          ticketType: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
}

export async function cancelTicketOrder(
  ticketOrderId: string,
  canceledById: string,
  reason: string,
  details?: string,
  refunded: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  return await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticketOrder.findUnique({
      where: { id: ticketOrderId },
      select: { id: true, status: true, orderId: true },
    });

    if (!ticket) {
      return { success: false, error: "Ticket no encontrado." };
    }

    if (ticket.status === "CANCELED") {
      return { success: false, error: "El ticket ya fue cancelado." };
    }

    await tx.ticketOrder.update({
      where: { id: ticketOrderId },
      data: { status: "CANCELED" },
    });

    await tx.canceledTicketOrder.create({
      data: {
        ticketOrderId,
        orderId: ticket.orderId,
        reason,
        details: details ?? null,
        refunded,
        canceledById,
      },
    });

    return { success: true };
  });
}

export async function atomicValidateTicket(
  ticketId: string,
  eventId: string,
  sessionId: string
): Promise<{ success: boolean; alreadyValidated: boolean; canceled: boolean }> {
  return await prisma.$transaction(async (tx) => {
    const result = await tx.ticketOrder.updateMany({
      where: {
        id: ticketId,
        eventId: eventId,
        status: "NOT_VALIDATED",
      },
      data: {
        status: "VALIDATED",
        validatedAt: new Date(),
        validatedBy: sessionId,
      },
    });

    if (result.count === 0) {
      const ticket = await tx.ticketOrder.findUnique({
        where: { id: ticketId },
        select: { status: true },
      });
      return {
        success: false,
        alreadyValidated: ticket?.status === "VALIDATED",
        canceled: ticket?.status === "CANCELED",
      };
    }

    await tx.validationEvent.create({
      data: {
        sessionId,
        ticketOrderId: ticketId,
        eventId,
        action: "VALIDATE",
      },
    });

    await tx.validatorSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });

    return { success: true, alreadyValidated: false, canceled: false };
  });
}

export async function atomicInvalidateTicket(
  ticketId: string,
  sessionId: string
): Promise<{ success: boolean }> {
  return await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticketOrder.findUnique({
      where: { id: ticketId },
      select: { eventId: true, status: true },
    });

    if (!ticket || ticket.status !== "VALIDATED") {
      return { success: false };
    }

    await tx.ticketOrder.update({
      where: { id: ticketId },
      data: {
        status: "NOT_VALIDATED",
        validatedAt: null,
        validatedBy: null,
      },
    });

    await tx.validationEvent.create({
      data: {
        sessionId,
        ticketOrderId: ticketId,
        eventId: ticket.eventId,
        action: "INVALIDATE",
      },
    });

    await tx.validatorSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });

    return { success: true };
  });
}

export async function getTicketsByTicketTypeId(ticketTypeId: string) {
  return await prisma.ticketOrder.findMany({
    where: {
      order: {
        ticketTypeId: ticketTypeId,
      },
    },
  });
}

export async function getTicketOrdersByEventId(eventId: string) {
  return await prisma.ticketOrder.findMany({
    where: {
      eventId: eventId,
      order: {
        status: "PAID",
      },
    },
    orderBy: [
      {
        name: "asc",
      },
      { createdAt: "desc" },
    ],
    include: {
      event: { select: { title: true } },
    },
  });
}

export async function getUsedInvitesByProducer(
  producerId: string,
): Promise<number> {
  const events = await prisma.event.findMany({
    where: { producerId },
    select: {
      orders: {
        where: {
          isInvitation: true,
        },
        select: {
          quantity: true,
        },
      },
    },
  });

  const totalInvites = events
    .flatMap((e) => e.orders)
    .reduce((acc, order) => acc + order.quantity, 0);
  return totalInvites;
}

export async function getMaxInvitesPerEvent(
  producerId: string,
): Promise<number> {
  const config = await prisma.producerConfiguration.findUnique({
    where: { producerId },
    select: { maxInvitesPerEvent: true },
  });

  return config?.maxInvitesPerEvent ?? 0;
}

export async function getTicketOrderById(id: string) {
  return await prisma.ticketOrder.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          ticketType: {
            select: {
              title: true,
            },
          },
        },
      },
      event: {
        select: {
          title: true,
          address: true,
          city: true,
          venue: true,
        },
      },
    },
  });
}

export async function getSoldTicketCountsByType(eventId: string) {
  const grouped = await prisma.ticketOrder.groupBy({
    by: ["ticketTypeId"],
    where: { eventId },
    _count: { id: true },
  });

  if (grouped.length === 0) return {};

  const ticketTypeIds = grouped
    .map((g) => g.ticketTypeId)
    .filter((id): id is string => id !== null);

  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: ticketTypeIds } },
    select: { id: true, title: true },
  });

  const titleMap = Object.fromEntries(ticketTypes.map((tt) => [tt.id, tt.title]));

  return Object.fromEntries(
    grouped
      .filter((g): g is typeof g & { ticketTypeId: string } => g.ticketTypeId !== null)
      .map((g) => [
        g.ticketTypeId,
        { id: g.ticketTypeId, title: titleMap[g.ticketTypeId] as string | undefined, count: g._count.id },
      ]),
  );
}

export async function getSoldTicketsPaginated(
  eventId: string,
  options: {
    page: number;
    pageSize: number;
    search?: string;
    onlyInvitations?: boolean;
    excludeInvitations?: boolean;
    excludeCanceled?: boolean;
    onlyCanceled?: boolean;
    validatedBySessionId?: string;
  },
) {
  const { page, pageSize, search, onlyInvitations, excludeInvitations, excludeCanceled, onlyCanceled, validatedBySessionId } = options;
  const skip = (page - 1) * pageSize;

  const sessionValidationMap = validatedBySessionId
    ? await prisma.validationEvent
        .findMany({
          where: { sessionId: validatedBySessionId, action: "VALIDATE" },
          select: { ticketOrderId: true, createdAt: true },
        })
        .then((events) => new Map(events.map((e) => [e.ticketOrderId, e.createdAt])))
    : undefined;

  const validatedTicketIds = sessionValidationMap
    ? Array.from(sessionValidationMap.keys())
    : undefined;

  const where = {
    eventId,
    ...(validatedTicketIds ? { id: { in: validatedTicketIds } } : {}),
    ...(onlyInvitations ? { isInvitation: true } : {}),
    ...(excludeInvitations ? { isInvitation: false } : {}),
    ...(excludeCanceled ? { status: { not: "CANCELED" as const } } : {}),
    ...(onlyCanceled ? { status: "CANCELED" as const } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { dni: { contains: search, mode: "insensitive" as const } },
            ...(Number.isInteger(Number(search.replace(/^0+/, "") || "0"))
              ? [{ code: { equals: Number(search.replace(/^0+/, "") || "0") } }]
              : []),
            {
              order: {
                ticketType: { title: { contains: search, mode: "insensitive" as const } },
              },
            },
          ],
        }
      : {}),
  };

  const [rawTickets, total] = await Promise.all([
    prisma.ticketOrder.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sessionValidationMap
        ? { validatedAt: "desc" }
        : { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        lastName: true,
        dni: true,
        email: true,
        status: true,
        eventId: true,
        date: true,
        code: true,
        isInvitation: true,
        createdAt: true,
        ticketType: { select: { title: true, dates: true } },
        order: {
          select: {
            email: true,
            customizationToken: true,
            customizedAt: true,
            event: { select: { title: true, venue: true, address: true } },
            ticketType: { select: { title: true } },
          },
        },
      },
    }),
    prisma.ticketOrder.count({ where }),
  ]);

  const tickets = sessionValidationMap
    ? rawTickets.map((t) => ({
        ...t,
        sessionValidatedAt: sessionValidationMap.get(t.id) ?? null,
      }))
    : rawTickets;

  return { tickets, total };
}

export async function getValidatorStatsByEvent(eventId: string): Promise<{ validated: number; total: number }> {
  const results = await prisma.ticketOrder.groupBy({
    by: ["status"],
    where: { eventId },
    _count: { id: true },
  });
  const validated = results.find((r) => r.status === "VALIDATED")?._count.id ?? 0;
  const total = results.reduce((sum, r) => sum + r._count.id, 0);
  return { validated, total };
}

export async function getValidatedCountBySession(sessionId: string): Promise<number> {
  return prisma.ticketOrder.count({
    where: { validatedBy: sessionId },
  });
}

export async function getAllTicketsForExport(eventId: string) {
  return prisma.ticketOrder.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      lastName: true,
      dni: true,
      email: true,
      createdAt: true,
      isInvitation: true,
      ticketType: { select: { title: true } },
    },
  });
}

export async function substractTicketQuantity(
  ticketTypeId: string,
  quantity: number,
  performedById: string,
) {
  return prisma.$transaction(async (tx) => {
    const ticketType = await tx.ticketType.findUniqueOrThrow({
      where: { id: ticketTypeId },
      select: {
        quantity: true,
        eventId: true,
        event: { select: { producerId: true } },
      },
    });

    const previousQuantity = ticketType.quantity;
    const newQuantity = previousQuantity - quantity;

    if (newQuantity < 0) {
      throw new Error("Not enough tickets available");
    }

    await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: { quantity: newQuantity },
    });

    await tx.ticketStockMovement.create({
      data: {
        ticketTypeId,
        eventId: ticketType.eventId,
        producerId: ticketType.event.producerId,
        performedById,
        type: "DECREASE",
        delta: -quantity,
        previousQuantity,
        newQuantity,
        reason: "Invitación",
      },
    });

    return newQuantity;
  });
}
