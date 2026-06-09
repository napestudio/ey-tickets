import {prisma} from "../prisma";
import { getStats } from "./eventos";

export async function createOrder(data: any) {
  return await prisma.order.create({
    data,
    include: {
      ticketType: true,
      event: {
        include: {
          discountCode: true,
        },
      },
    },
  });
}

export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      ticketType: true,
      event: {
        include: {
          discountCode: true,
        },
      },
    },
  });
}

export async function getOrderWithTickets(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tickets: true,
      event: true,
    },
  });
}

export async function getOrdersByEvent(eventId: string) {
  return await prisma.order.findMany({
    where: {
      eventId: eventId,
      status: "PAID",
    },
    include: {
      ticketType: true,
      event: true,
      tickets: true,
    },
  });
}

export async function getPaidOrdersDataByEvent(eventId: string) {
  return await prisma.order.findMany({
    where: {
      eventId: eventId,
      status: "PAID",
    },
    include: {
      tickets: {
        select: {
          id: true,
        },
      },
      ticketType: {
        select: {
          title: true,
        },
      },
    },
  });
}

// Crear type para order
export async function updateOrder(orderId: string, orderData: any) {
  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: orderData,
  });
}

export async function createInvitationOrder(data: any) {
  return await prisma.order.create({
    data,
    include: {
      ticketType: true,
    },
  });
}

export async function getOrderByCustomizationToken(token: string) {
  return await prisma.order.findUnique({
    where: { customizationToken: token },
    include: {
      tickets: true,
      event: true,
      ticketType: true,
    },
  });
}

export async function markOrderAsCustomized(
  orderId: string,
  guestData: {
    name: string;
    lastName: string;
    dni: string;
    email: string;
  },
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      name: guestData.name,
      lastName: guestData.lastName,
      dni: guestData.dni,
      email: guestData.email,
      customizedAt: new Date(),
    },
  });
}
