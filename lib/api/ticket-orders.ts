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

export async function validateTicketById(ticketId: string, eventId: string) {
  return await prisma.ticketOrder.update({
    where: {
      id: ticketId,
      eventId: eventId,
    },
    data: {
      status: "VALIDATED",
    },
  });
}

export async function invalidateTicketById(ticketId: string) {
  return await prisma.ticketOrder.update({
    where: {
      id: ticketId,
    },
    data: {
      status: "NOT_VALIDATED",
    },
  });
}

export async function getTicketStatusById(ticketId: string) {
  return await prisma.ticketOrder.findUnique({
    where: { id: ticketId },
    select: {
      status: true,
    },
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

  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: grouped.map((g) => g.ticketTypeId) } },
    select: { id: true, title: true },
  });

  const titleMap = Object.fromEntries(ticketTypes.map((tt) => [tt.id, tt.title]));

  return Object.fromEntries(
    grouped.map((g) => [
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
  },
) {
  const { page, pageSize, search, onlyInvitations, excludeInvitations } = options;
  const skip = (page - 1) * pageSize;

  const where = {
    eventId,
    ...(onlyInvitations ? { isInvitation: true } : {}),
    ...(excludeInvitations ? { isInvitation: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            {
              order: {
                ticketType: { title: { contains: search, mode: "insensitive" as const } },
              },
            },
          ],
        }
      : {}),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticketOrder.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        lastName: true,
        dni: true,
        email: true,
        date: true,
        code: true,
        isInvitation: true,
        createdAt: true,
        ticketType: { select: { title: true, dates: true } },
        order: {
          select: {
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

  return { tickets, total };
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
) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    select: { quantity: true },
  });
  
  if (!ticketType) {
    throw new Error("Ticket type not found");
  }
  const newQuantity = ticketType.quantity - quantity;
  if (newQuantity < 0) {
    throw new Error("Not enough tickets available");
  }
  await prisma.ticketType.update({
    where: { id: ticketTypeId },
    data: { quantity: newQuantity },
  });
  return newQuantity;
}
