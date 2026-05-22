import {prisma} from "../prisma";

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
      })
    )
  );
  return createdOrders;
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

export async function getUsedInvitesByProducer(producerId: string): Promise<number> {
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

export async function getMaxInvitesPerEvent(producerId: string): Promise<number> {
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
