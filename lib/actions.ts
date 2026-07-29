"use server";

import * as Eventos from "@/lib/api/eventos";
import { computeEventEndDate } from "@/lib/api/eventos";
import * as Orders from "@/lib/api/orders";
import * as TicketTypes from "@/lib/api/ticket-types";
import * as Users from "@/lib/api/users";
import * as Configuration from "@/lib/api/user-configuration";
import * as TicketOrders from "@/lib/api/ticket-orders";
import * as Code from "@/lib/api/descuento-code";
import * as ValidatorToken from "@/lib/api/validators-token";
import * as UserInvitation from "@/lib/api/user-invitations";
import * as PaymentMethod from "@/lib/api/payment-methods";
import * as TicketStock from "@/lib/api/ticket-stock";
import { createStockPurchasePreference } from "@/lib/api/eytickets-mercadopago";
import { getActiveFeaturedEventsForCarousel } from "@/lib/api/superadmin/featured-events";
import { getUnitPriceForQuantity } from "@/lib/ticket-stock-catalog";
import {
  updateProducer,
  updateProducerConfiguration,
} from "@/lib/api/producers";

import { EventCategory, EventStatus, EventType } from "@/types/event";
import { Product } from "@/types/product";
import { DatesType, TicketOrderType, TicketType } from "@/types/tickets";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DiscountCode } from "@/types/discount-code";
import { UserInvitation as InvitationType } from "@/types/user-invitations";
import bcrypt from "bcryptjs";
import {
  sendTicketConfirmationEmail,
  sendPasswordResetEmail,
  type QrTicketEmailData,
} from "@/emails/send";
import { generatePasswordResetToken } from "./tokens";
import { randomUUID } from "crypto";
import {
  getPasswordResetTokenByToken,
  removePasswordResetTokenById,
} from "./api/reset-password-token";
import { stat } from "fs";
import { getPaidOrdersDataByEvent } from "@/lib/api/orders";
import { substractTicketQuantity } from "@/lib/api/ticket-orders";
import { User, OrganizationRole } from "@/types/user";
import { UserConfiguration } from "@/types/user-configuration";

import {
  uploadImage as cloudinaryUpload,
  deleteImage as cloudinaryDelete,
} from "@/lib/cloudinary-upload";
import { TicketOrder } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Type temporal
export type Evento = {
  title: string;
  slug: string;
  description: string;
  address: string;
  state?: string | null;
  city?: string | null;
  producerId: string;
  createdById?: string;
  image: string | null;
  imagePublicId?: string | null;
  dates: string;
  status: EventStatus;
  saleEndDate: string;
  category?: EventCategory | null;
  eventType?: EventType;
  legalText?: string | null;
  restrictions?: string[];
  venue?: string | null;
  ageRestriction?: number | null;
  website?: string | null;
};

export async function createEvent(data: Evento) {
  let eventId = null;
  const { producerId, ...rest } = data;
  const eventEndDate = computeEventEndDate(data.dates);
  const result = await Eventos.createEvent({
    ...rest,
    eventEndDate,
    producer: { connect: { id: producerId } },
  } as any);
  eventId = result.id;

  revalidatePath("/dashboard");
  revalidatePath("/eventos");
  revalidatePath("/");

  if (eventId) {
    redirect(`/dashboard/evento/${eventId}`);
  }
}

export async function createEventAndReturnId(
  data: Evento,
): Promise<{ eventId: string }> {
  const { producerId, ...rest } = data;
  const eventEndDate = computeEventEndDate(data.dates);
  const result = await Eventos.createEvent({
    ...rest,
    eventEndDate,
    producer: { connect: { id: producerId } },
  } as any);

  revalidatePath("/dashboard");
  revalidatePath("/eventos");
  revalidatePath("/");

  return { eventId: result.id };
}

export async function updateEvent(data: Partial<Evento>, eventId: string) {
  try {
    const eventEndDate = data.dates
      ? computeEventEndDate(data.dates)
      : undefined;
    const result = await Eventos.updateEvent(eventId, {
      ...data,
      ...(eventEndDate !== undefined ? { eventEndDate } : {}),
    });
    revalidatePath(`/dashboard/evento/${result.id}/edit`);
    revalidatePath(`/dashboard/evento/${result.id}`);
    revalidatePath(`/eventos/${result.slug}`);
    revalidatePath("/eventos");
    revalidatePath(`/`);
  } catch (error) {
    throw new Error("Error editando el evento");
  }
}

export async function cancelEvent(eventId: string) {
  const data = { status: "CANCELED" };
  try {
    const result = await Eventos.updateEvent(eventId, data as Evento);
    revalidatePath(`/dashboard/evento/${result.id}`);
    revalidatePath(`/eventos/${result.slug}`);
    revalidatePath("/eventos");
  } catch (error) {
    throw new Error("Error cancelando el evento");
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const data = { status: "DELETED" };
    const result = await Eventos.updateEvent(eventId, data as Evento);

    revalidatePath(`/dashboard`);
    revalidatePath("/eventos");
    return result;
  } catch (error) {
    throw new Error("Error editando el evento");
  }
}

// Para el sitio
export async function getSingleEventById(eventId: string) {
  const result = await Eventos.getSingleEvent(eventId);
  return result;
}

export async function getSingleEventBySlug(slug: string) {
  const result = await Eventos.getSingleEventBySlug(slug);
  return result;
}
// Para el dashboard
export async function getEventById(eventId: string) {
  const result = await Eventos.getEventById(eventId);
  return result;
}
export async function getEventsByMemberId(userId: string) {
  const result = await Eventos.getEventsByMemberId(userId);
  return result;
}

/** @deprecated Use getEventsByMemberId instead */
export async function getEventsBySellerId(sellerId: string) {
  return getEventsByMemberId(sellerId);
}

export async function getEventIdByToken(token: string) {
  try {
    const result = await ValidatorToken.getEventByToken(token);
    return result;
  } catch (error) {
    throw new Error("Error");
  }
}

export async function getStats({
  ticketTypeId,
  eventId,
}: {
  ticketTypeId?: string;
  eventId?: string;
}) {
  try {
    const result = await Eventos.getStats({ ticketTypeId, eventId });
    return result;
  } catch (error) {
    throw new Error("Error trayendo estadisticas");
  }
}

export async function getOrdersByEvent(eventId: string) {
  try {
    const result = await Orders.getOrdersByEvent(eventId);
    return result;
  } catch (error) {
    throw new Error("Error");
  }
}

export async function getOrderTicketsByEvent(eventId: string) {
  try {
    const result = await TicketOrders.getOrderTicketsByEvent(eventId);
    return result;
  } catch (error) {
    throw new Error("Error GET order tickets");
  }
}
export async function getTicketOrdersByEventId(eventId: string) {
  try {
    const result = await TicketOrders.getTicketOrdersByEventId(eventId);
    const response = {
      evento: {
        title: result[0].event.title,
      },
      result,
    };
    return response;
  } catch (error) {
    throw new Error("Error GET order tickets");
  }
}

export async function getTicketTypesByEventId(eventId: string) {
  try {
    const result = await TicketTypes.getTicketTypesByEventId(eventId);
    return result;
  } catch (error) {
    throw new Error("Error en getTicketTypesByEventId");
  }
}

export async function getTicketTypesWithStatsByEventId(eventId: string) {
  try {
    return await TicketTypes.getTicketTypesWithStatsByEventId(eventId);
  } catch (error) {
    throw new Error("Error en getTicketTypesWithStatsByEventId");
  }
}

export async function getTyicketTypeById(ticketTypeId: string) {
  try {
    const result = await TicketTypes.getTicketTypesById(ticketTypeId);
    return result;
  } catch (error) {
    throw new Error("Error en getTicketTypesByEventId");
  }
}

export async function getTicketTypeWithSoldCount(ticketTypeId: string) {
  try {
    return await TicketTypes.getTicketTypeWithSoldCount(ticketTypeId);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error trayendo el tipo de ticket",
    );
  }
}

export async function getRemainingTicketsByProducer(producerId: string) {
  try {
    const result = await TicketTypes.getRemainingTicketsByProducer(producerId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo limite de tickets");
  }
}

export async function getRemainingTicketsForEvent(
  eventId: string,
  producerId: string,
) {
  try {
    return await TicketStock.getRemainingTicketsForEvent(eventId, producerId);
  } catch (error) {
    throw new Error("Error trayendo disponibilidad del evento");
  }
}

export async function getMaxInvitesPerEvent(producerId: string) {
  try {
    const result = await TicketOrders.getMaxInvitesPerEvent(producerId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo limite de invitaciones");
  }
}

export async function getUsedInvitesByProducer(producerId: string) {
  try {
    const result = await TicketOrders.getUsedInvitesByProducer(producerId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo limite de invitaciones");
  }
}

export async function createTicketType(data: TicketType) {
  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id ?? null;

  const dataWithCreator = { ...data, createdById };

  try {
    const event = await Eventos.getEventById(data.eventId);
    if (!event?.producerId) {
      throw new Error("El evento no tiene una productora asignada.");
    }
    await TicketTypes.createTicketTypeWithLimit(
      dataWithCreator,
      event.producerId,
      createdById ?? undefined,
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error creando el TicketType",
    );
  }

  revalidatePath(`/dashboard/evento/ticket-types/${data.eventId}`);
}

export async function updateTicketType(
  data: Partial<TicketType>,
  ticketId: string,
) {
  try {
    await TicketTypes.updateTicketTypeWithLimit(ticketId, data);
    revalidatePath(`/dashboard/evento/${data.eventId}`);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error editando el tipo de ticket",
    );
  }
}

export async function adjustTicketStock(
  ticketTypeId: string,
  delta: number,
  reason?: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No autorizado.");

  const { id: performedById, producerId } = session.user;
  if (!producerId) throw new Error("Sin productora asignada.");

  try {
    const result = await TicketTypes.adjustTicketTypeStock(
      ticketTypeId,
      delta,
      performedById,
      producerId,
      reason,
    );
    const ticketType = await TicketTypes.getTicketTypesById(ticketTypeId);
    if (ticketType) {
      revalidatePath(`/dashboard/evento/ticket-types/${ticketType.eventId}`);
    }
    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error ajustando el stock.",
    );
  }
}

export async function getTicketStockMovements(ticketTypeId: string) {
  return TicketTypes.getStockMovementsByTicketType(ticketTypeId);
}

export type CreateOrderType = {
  ticketTypeId: string;
  status: string;
  quantity: number;
  eventId: string;
  hasCode: boolean;
  discountCode: string | undefined;
  totalPrice: number;
  subtotal?: number;
  discountAmount?: number;
  serviceChargeAmount?: number;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dni?: string;
  paymentMethodId?: string;
};

export async function createOrder(data: CreateOrderType) {
  let orderId = null;
  try {
    const result = await Orders.createOrder(data);
    orderId = result.id;
  } catch (error) {
    throw new Error("Error creando la order");
  }
  if (orderId) {
    redirect(`/orders/${orderId}`);
  }

  revalidatePath("/dashboard");
}

export async function createCashOrder(data: CreateOrderType) {
  try {
    const result = await Orders.createOrder(data);
    if (result) {
      const dates = JSON.parse(result.ticketType.dates!);
      const is2x1 = result.ticketType.buyGet === 2;
      result.quantity = is2x1 ? result.quantity * 2 : result.quantity;

      const ticketsData: TicketOrderType[] = [];
      dates.forEach((dateObj: DatesType) => {
        for (let i = 0; i < result.quantity; i++) {
          ticketsData.push({
            name: result.name!,
            lastName: result.lastName!,
            dni: result.dni!,
            email: result.email!,
            base64Qr: "code",
            date: new Date(dateObj.date),
            orderId: result.id,
            eventId: result.eventId,
            status: "NOT_VALIDATED",
            ticketTypeId: result.ticketTypeId,
            isInvitation: false,
          });
        }
      });
      await createTicketOrder(ticketsData);
    }
  } catch (error) {
    throw new Error("Error creando la order");
  }
}

export async function getOrderById(orderId: string) {
  try {
    return await Orders.getOrderById(orderId);
  } catch (error) {
    throw new Error("Error get order by id");
  }
}

export async function updateOrder(data: any, orderId: string) {
  try {
    const result = await Orders.updateOrder(orderId, data);
    revalidatePath(`/orders/${result.id}`);
  } catch (error) {
    throw new Error("Error editando la order");
  }
}

export async function getAllUsersByProducerId(producerId: string) {
  try {
    const result = await Users.getUsersByProducerId(producerId);
    return result;
  } catch (error) {}
}

/** @deprecated Use getAllUsersByProducerId instead */
export async function getAllUsersByClientId(producerId: string) {
  return getAllUsersByProducerId(producerId);
}

export async function getUsersByType(
  producerId: string,
  role: OrganizationRole,
) {
  try {
    const result = await Users.getUsersByProducerAndRole(producerId, role);
    return result;
  } catch (error) {
    throw new Error("Error trayendo usuarios por rol");
  }
}

export async function getAllUsersButAdmins() {
  try {
    const result = await Users.getAllUsers();
    return result;
  } catch (error) {}
}

export async function updateUser(data: any, userEmail: string) {
  try {
    const result = await Users.updateUser(data, userEmail);
    revalidatePath(`/dashboard/evento/${result.id}`);
  } catch (error) {
    throw new Error("Error editando el usuario");
  }
}

export async function updateUserById(data: Partial<User>, userId: string) {
  try {
    const result = await Users.updateUserById(data, userId);
    revalidatePath(`/dashboard/configuracion/usuarios/`);
    return result;
  } catch (error) {
    throw new Error("Error editando el usuario");
  }
}

export async function updateUserRole(userId: string, role: OrganizationRole) {
  try {
    await Users.updateUserRole(userId, role);
    revalidatePath(`/dashboard/configuracion/usuarios/`);
  } catch (error) {
    throw new Error("Error actualizando rol del usuario");
  }
}

export async function deleteUser(userId: string, userEmail: string) {
  try {
    const result = await Users.deleteUser(userId, userEmail);

    revalidatePath(`/dashboard/configuracion/usuarios`);
    return result;
  } catch (error) {
    throw new Error("Error eliminando el usuario");
  }
}

type PaymentMethodInput = {
  name?: string;
  type: "CASH" | "DIGITAL" | "TRANSFER";
  producerId: string;
  userId?: string;
  apiKey?: string | null;
  cbu?: string | null;
  alias?: string | null;
  transferEmail?: string | null;
  enabled?: boolean;
  creatorId?: string;
  commissionPercentage?: number | null;
};

export async function createPaymentMethod(data: PaymentMethodInput) {
  try {
    const method = await PaymentMethod.createPaymentMethod(data);
    revalidatePath("/dashboard/configuracion/metodos-de-pago");
    return method;
  } catch (error) {
    throw new Error(`Error creando Metodo de Pago: ${error}`);
  }
}

export async function createPuntoDeVenta(data: PaymentMethodInput) {
  const { userId } = data;
  if (!userId) {
    throw new Error("Punto de venta requiere un vendedor asignado");
  }
  try {
    const method = await PaymentMethod.createPaymentMethod({
      ...data,
      type: "CASH",
    });
    revalidatePath("/dashboard/punto-de-venta");
    return method;
  } catch (error) {
    throw new Error(`Error creando Punto de Venta: ${error}`);
  }
}

export async function updatePaymentMethod(
  data: PaymentMethodInput,
  paymentMethodId: string,
) {
  try {
    const method = await PaymentMethod.updatePaymentMethod(
      data,
      paymentMethodId,
    );
    revalidatePath("/dashboard/configuracion/metodos-de-pago");
    revalidatePath("/dashboard/punto-de-venta");
    return method;
  } catch (error) {
    throw new Error(`Error actualizando Metodo de Pago: ${error}`);
  }
}

export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const result =
      await PaymentMethod.deletePaymentMethodAction(paymentMethodId);

    revalidatePath(`/dashboard/configuracion/metodos-de-pago`);
    return result;
  } catch (error) {
    throw new Error("Error eliminando metodo de pago");
  }
}

type AssignPaymentMethodsInput = {
  eventId: string;
  paymentMethodIds: string[];
};

export async function assignPaymentMethodsToEvent({
  eventId,
  paymentMethodIds,
}: AssignPaymentMethodsInput) {
  try {
    const result = await PaymentMethod.assignPaymentMethodsToEvent({
      eventId,
      paymentMethodIds,
    });
    return result;
  } catch (error) {
    throw new Error("Error asignando método de pago");
  }
}

type UnassignInput = {
  eventId: string;
  paymentMethodId: string;
};

export async function unassignPaymentMethodFromEvent({
  eventId,
  paymentMethodId,
}: UnassignInput) {
  try {
    const methods = await PaymentMethod.unassignPaymentMethodFromEvent({
      eventId,
      paymentMethodId,
    });
    return methods;
  } catch (error) {
    throw new Error("Error quitando método de pago");
  }
}

export async function getPaymentMethodsByProducerId(producerId: string) {
  try {
    const methods =
      await PaymentMethod.getPaymentMethodsByProducerId(producerId);
    return methods;
  } catch (error) {
    throw new Error("Error buscando metodos de pago por productora");
  }
}

/** @deprecated Use getPaymentMethodsByProducerId instead */
export async function getPaymentMethodsByClientId(producerId: string) {
  return getPaymentMethodsByProducerId(producerId);
}

export async function getPaymentMethodsByCreatorId(creatorId: string) {
  try {
    const methods = await PaymentMethod.getPaymentMethodsByCreatorId(creatorId);
    return methods;
  } catch (error) {
    throw new Error("Error buscando metodos de pago por creatorId");
  }
}

export async function getMercadoPagoTokenByUser(userId: string) {
  return null;
}

export async function getDigitalPaymentMethodKeyByEvent(eventId: string) {
  try {
    const result = await PaymentMethod.getDigitalPaymentMethodByEvent(eventId);
    return result;
  } catch (error) {
    throw new Error("Error get mercadoPagoTokenByUser");
  }
}

export async function getMercadPagoUrl(
  product: any,
  orderData: any,
  orderId: string,
  userId: string,
) {
  // Cambiar type de product y ademas pedir la data del form para updatear la order
  updateOrder(orderData, orderId);
  let preference = null;
  const MP_ACCESS_TOKEN = await getMercadoPagoTokenByUser(userId);
  const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN!,
  });

  const siteUrl = process.env.MP_SITE_URL;
  try {
    preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: `${product.title}-${Math.floor(Math.random() * 100000)}`,
            title: `${product.title} x${product.quantity}`,
            unit_price: product.price * product.quantity,
            quantity: 1,
          },
        ],
        external_reference: orderId,
        auto_return: "approved",
        back_urls: {
          success: `${siteUrl}/`,
          failure: `${siteUrl}/`,
        },
        notification_url: `${siteUrl}/api/mp-notify?user_id=${userId}`,
      },
    });
  } catch (error) {
    throw new Error("Error MercadoPago");
  }
  if (preference) {
    // if (process.env.NODE_ENV === "production") {
    redirect(preference.init_point!);
    // } else {
    // redirect(preference.sandbox_init_point!);
    // }
  }
}

type MpPaymentData = {
  mpPaymentId: string;
  mpDateApproved: Date | null;
  mpPaymentMethodId: string | null;
  mpPaymentTypeId: string | null;
  mpInstallments: number | null;
  mpAuthorizationCode: string | null;
};

export async function payOrderHandler(orderId: string, mpData?: MpPaymentData) {
  try {
    const order = await getOrderById(orderId);
    if (!order || order.status === "PAID") return;

    const dates = JSON.parse(order.ticketType.dates!);
    const is2x1 = order.ticketType.buyGet === 2;
    order.quantity = is2x1 ? order.quantity * 2 : order.quantity;

    await updateOrder(
      {
        status: "PAID",
        ...(mpData && {
          mpPaymentId: mpData.mpPaymentId,
          mpDateApproved: mpData.mpDateApproved,
          mpPaymentMethodId: mpData.mpPaymentMethodId,
          mpPaymentTypeId: mpData.mpPaymentTypeId,
          mpInstallments: mpData.mpInstallments,
          mpAuthorizationCode: mpData.mpAuthorizationCode,
        }),
      },
      orderId,
    );

    const ticketsData: TicketOrderType[] = [];
    dates.forEach((dateObj: DatesType) => {
      for (let i = 0; i < order.quantity; i++) {
        ticketsData.push({
          name: order.name!,
          lastName: order.lastName!,
          dni: order.dni!,
          email: order.email!,
          base64Qr: "code",
          date: new Date(dateObj.date),
          orderId: orderId,
          ticketTypeId: order.ticketTypeId,
          eventId: order.event.id,
          status: "NOT_VALIDATED",
          isInvitation: false,
        });
      }
    });

    await createTicketOrder(ticketsData);
  } catch (error) {
    throw new Error("Error creando free ticket");
  }
}

export async function createFreeTicket(
  orderData: any,
  orderId: string,
  userId: string,
) {
  try {
    updateOrder(orderData, orderId);
    payOrderHandler(orderId);
  } catch (error) {
    throw new Error("Error creando free ticket");
  }
}

export async function createTicketOrder(tickets: TicketOrderType[]) {
  try {
    const result = await TicketOrders.createTicketOrder(tickets);
    if (result.length > 0) {
      await sendTicketMail(result as TicketOrderType[]);
      const stats = await getStats({ ticketTypeId: result[0].ticketTypeId! });

      if (stats.totalSold >= result[0].ticketType?.quantity!) {
        updateTicketType({ status: "SOLDOUT" }, result[0].ticketTypeId!);
      }
    }
  } catch (error) {
    throw new Error("Error tickets");
  }
}

export async function sendTicketMail(tickets: TicketOrderType[]) {
  const qrTickets: QrTicketEmailData[] = [];
  const eventData = await Eventos.getEventById(tickets[0].eventId!);

  for (const ticket of tickets) {
    qrTickets.push({
      code: ticket.code ?? 0,
      ticketId: ticket.id ?? "",
      date: ticket.date,
      ticketType: { title: ticket.ticketType?.title ?? "" },
    });
  }

  await sendTicketConfirmationEmail({
    recipientEmail: tickets[0].email,
    eventTitle: eventData?.title ?? "",
    eventLocation: eventData?.venue ?? eventData?.city ?? "",
    eventAddress: eventData?.address ?? "",
    tickets: qrTickets,
  });
}

export async function setQrCode(ticketId = "") {
  return `${process.env.BASE_URL}/api/tickets/qr/${ticketId}`;
}

export async function validateTicketById(ticketId: string, eventId: string) {
  const status = await TicketOrders.getTicketStatusById(ticketId);
  if (status?.status === "VALIDATED") {
    return false;
  }
  try {
    const result = await TicketOrders.validateTicketById(ticketId, eventId);
    return result;
  } catch (error) {
    throw new Error("Error validando el ticket");
  }
}

export async function invalidateTicketById(ticketId: string) {
  try {
    const result = await TicketOrders.invalidateTicketById(ticketId);
    return result;
  } catch (error) {
    throw new Error("Error invalidando el ticket");
  }
}

export async function getAllUserConfiguration(userId: string) {
  try {
    const result = await Configuration.getAllUserConfiguration(userId);
    return result;
  } catch (error) {
    throw new Error("Error get notificaciones");
  }
}

export async function createUserConfiguration(userId: string) {
  try {
    const result = await Configuration.createUserConfiguration(userId);
    return result;
  } catch (error) {
    throw new Error("Error creando configuracion del usuario");
  }
}

export async function updateUserConfiguration(
  data: Partial<UserConfiguration>,
  configId: string,
  userId: string,
) {
  try {
    if (!configId) {
      const resp = await Configuration.createUserConfiguration(userId);
      await Configuration.updateUserConfiguration(data, resp.id);
    } else {
      await Configuration.updateUserConfiguration(data, configId);
    }

    revalidatePath(`/dashboard/configuracion`);
  } catch (error) {
    throw new Error("Error editando la configuracion");
  }
}

export async function getServiceCharge(producerId: string) {
  try {
    const result = await Configuration.getProducerConfiguration(producerId);
    return result?.serviceCharge ?? 0;
  } catch (error) {
    throw new Error("Error trayendo service charge");
  }
}

export async function createDiscountCode(data: DiscountCode) {
  let codeId = null;
  try {
    const result = await Code.createDiscountCode(data);

    revalidatePath(`/dashboard/evento/${result.eventId}`);
  } catch (error) {
    throw new Error("Error creando el código de descuento");
  }
}

export async function updateDiscountCode(data: DiscountCode, eventId: string) {
  try {
    const result = await Code.updateDiscountCode(eventId, data);
    revalidatePath(`/dashboard/evento/${result.eventId}`);
  } catch (error) {
    throw new Error("Error editando el evento");
  }
}

export async function deleteDiscountCode(eventId: string) {
  try {
    const data = { status: "DELETED" };
    const result = await Code.updateDiscountCode(eventId, data as DiscountCode);

    revalidatePath(`/dashboard/evento/${result.eventId}`);
    return result;
  } catch (error) {
    throw new Error("Error editando el evento");
  }
}

export async function getDiscountCodeById(eventId: string) {
  try {
    const result = await Code.getDiscountCodeById(eventId);
    return result;
  } catch (error) {
    throw new Error("Error en getDiscountCodeById");
  }
}

export async function createValidatorToken(data: any) {
  try {
    const result = await ValidatorToken.createValidatorToken(data);
    revalidatePath(`/dashboard/evento/${data.eventId}`);
  } catch (error) {
    throw new Error("Error validators token");
  }
}

export async function getTokensByEvent(eventId: string) {
  try {
    const result = await ValidatorToken.getTokensByEvent(eventId);
    return result;
  } catch (error) {
    throw new Error("Error getTokensByEvent");
  }
}

export async function deleteTokenById(tokenId: string) {
  try {
    const result = await ValidatorToken.deleteTokenById(tokenId);
    revalidatePath(`/dashboard`);
    return result;
  } catch (error) {
    throw new Error("Error eliminando token de validación");
  }
}

export async function createUserInvitation(data: InvitationType) {
  try {
    const result = await UserInvitation.createUserInvitation(data);
    revalidatePath("/dashboard/configuracion/usuarios");
    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error creando la invitación",
    );
  }
}
export async function updateUserInvitationById(
  data: InvitationType,
  invitationId: string,
) {
  try {
    const result = await UserInvitation.updateInvitationsById(
      data,
      invitationId,
    );
    revalidatePath("/dashboard/configuracion/usuarios");
    return result;
  } catch (error) {
    throw new Error("Error creando la invitación");
  }
}

export async function removeInvitationById(invitadionId: string) {
  try {
    const result = await UserInvitation.removeInvitationById(invitadionId);
    revalidatePath("/dashboard/configuracion/usuarios");
    return result;
  } catch (error) {
    throw new Error("Error eliminando la invitación");
  }
}

export async function getInvitationsByUser(userId: string) {
  try {
    const result = await UserInvitation.getInvitationsByUser(userId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo invitations");
  }
}

export async function getPendingInvitationsByUser(userId: string) {
  try {
    const result = await UserInvitation.getPendingInvitationsByUser(userId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo invitations");
  }
}

export async function getInvitationsById(invitationId: string) {
  try {
    const result = await UserInvitation.getInvitationsById(invitationId);
    return result;
  } catch (error) {
    throw new Error("Error getInvitationsById");
  }
}

export async function registerUser(data: { email: string; password: string }) {
  try {
    const userData = await Users.getUserByEmailForRegister(data.email);
    if (userData) {
      return true;
    }

    const userInvitation = await UserInvitation.getInvitationsByEmail(
      data.email,
    );
    if (!userInvitation) {
      throw new Error("No se ha encontrado una invitación");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await Users.createUser({
      email: data.email,
      password: hashedPassword,
    });

    await prisma.producerMember.create({
      data: {
        userId: result.id,
        producerId: userInvitation.producerId,
        role: userInvitation.role,
      },
    });

    await UserInvitation.acceptInvitation(userInvitation.id);
  } catch (error) {
    throw new Error("Error creando el usuario");
  }
}

export async function resetPassword(email: string) {
  try {
    const existingUser = await Users.getUserByEmailForRegister(email);
    if (!existingUser) {
      return { ok: false };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail({
      recipientEmail: passwordResetToken.email,
      resetToken: passwordResetToken.token,
    });
    return { ok: true };
  } catch (error) {
    throw new Error("Error reiniciando contraseña");
  }
}

export async function confirmNewPassword(password: string, token: string) {
  try {
    if (!token) return { ok: false };
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) return { ok: false };
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { ok: false };
    const existingUser = await Users.getUserByEmail(existingToken.email);
    if (!existingUser) return { ok: false };

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;

    await Users.updateUser(existingUser, existingUser.email!);
    await removePasswordResetTokenById(existingToken.id);

    return { ok: true };
  } catch (error) {
    throw new Error("Error confirmando nueva contraseña");
  }
}

export async function getTicketAmountByTicketTypeId(ticketTypeId: string) {
  try {
    const result = await TicketOrders.getTicketsByTicketTypeId(ticketTypeId);
    return result.length;
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}

// export async function getSoldTicketsByType(eventId: string) {
export async function getSoldTicketsByType(tickets: any[]) {
  try {
    let ticketCounts: Record<
      string,
      { id?: string; title?: string; count: number }
    > = {};

    tickets.forEach((ticket) => {
      if (!ticketCounts[ticket.ticketType.id]) {
        ticketCounts[ticket.ticketType.id] = {
          id: ticket.ticketType.id,
          title: ticket.ticketType.title,
          count: 1,
        };
      } else {
        ticketCounts[ticket.ticketType.id].count++;
      }
    });

    return ticketCounts;
  } catch (error) {
    throw new Error("Error trayendo la cantidad de entradas vendidas");
  }
}

export async function uploadEventImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, status: 400 };
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { v4: uuidv4 } = await import("uuid");
    const res = await cloudinaryUpload(buffer, "events", uuidv4());
    return {
      url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
    };
  } catch {
    return { ok: false, status: 400 };
  }
}

export async function deleteEventImage(publicId: string) {
  try {
    return await cloudinaryDelete(publicId);
  } catch {
    throw new Error("Error eliminando la imagen");
  }
}

export type InvitationMethodInput = {
  quantity: number;
  email: string;
  ticketTypeId: string;
  isInvitation: boolean;
  status: string;
  eventId: string | undefined;
  name: string;
  lastName: string;
  dni: string;
  totalPrice: number;
  isCustomizable?: boolean;
};

export async function inviteUserToEvent(
  data: InvitationMethodInput,
): Promise<{ customizationToken?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("No autenticado");
    }

    const customizationToken = data.isCustomizable ? randomUUID() : undefined;

    const orderPayload = {
      quantity: data.quantity,
      email: data.isCustomizable ? null : data.email,
      name: data.isCustomizable ? null : data.name,
      lastName: data.isCustomizable ? null : data.lastName,
      dni: data.isCustomizable ? null : data.dni,
      ticketTypeId: data.ticketTypeId,
      isInvitation: true,
      status: data.status,
      eventId: data.eventId,
      totalPrice: data.totalPrice,
      customizationToken: customizationToken ?? null,
    };

    const result = await Orders.createInvitationOrder(orderPayload);
    if (result) {
      const dates = JSON.parse(result.ticketType.dates!);
      const is2x1 = result.ticketType.buyGet === 2;
      result.quantity = is2x1 ? result.quantity * 2 : result.quantity;

      const ticketsData: TicketOrderType[] = [];
      dates.forEach((dateObj: DatesType) => {
        for (let i = 0; i < result.quantity; i++) {
          ticketsData.push({
            name: data.isCustomizable ? "" : result.name!,
            lastName: data.isCustomizable ? "" : result.lastName!,
            dni: data.isCustomizable ? "" : result.dni!,
            email: data.isCustomizable ? "" : result.email!,
            base64Qr: "code",
            date: new Date(dateObj.date),
            orderId: result.id,
            eventId: result.eventId,
            status: "NOT_VALIDATED",
            ticketTypeId: result.ticketTypeId,
            isInvitation: true,
          });
        }
      });
      await TicketOrders.createTicketOrder(ticketsData);

      const newQuantity = ticketsData.length;
      await substractTicketQuantity(result.ticketTypeId, newQuantity, session.user.id);

      revalidatePath(`/dashboard/evento/${result.eventId}`);

      return { customizationToken };
    }
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error creando la invitacion: ${message}`);
  }
}

export async function submitCustomizationForm(
  token: string,
  tickets: Array<{
    id: string;
    name: string;
    lastName: string;
    dni: string;
    email: string;
  }>,
) {
  const order = await Orders.getOrderByCustomizationToken(token);

  if (!order) throw new Error("Invitación no encontrada");
  if (order.customizedAt) throw new Error("Esta invitación ya fue completada");

  await TicketOrders.updateInvitationTicketOrders(tickets);

  const firstTicket = tickets[0];
  await Orders.markOrderAsCustomized(order.id, {
    name: firstTicket.name,
    lastName: firstTicket.lastName,
    dni: firstTicket.dni,
    email: firstTicket.email,
  });
}

export async function getInvitationByToken(token: string) {
  return await Orders.getOrderByCustomizationToken(token);
}

export async function updateInvitationTicketOrders(
  tickets: Partial<TicketOrder>[],
) {
  try {
    const result = await TicketOrders.updateInvitationTicketOrders(tickets);
    return result;
  } catch (error) {
    throw new Error("Error actualizando las invitaciones");
  } finally {
    redirect("/dashboard/eventos");
  }
}

export async function getTicketOrderById(ticketId: string) {
  try {
    const result = await TicketOrders.getTicketOrderById(ticketId);
    return result;
  } catch (error) {
    throw new Error("Error trayendo la orden de tickets");
  }
}

export const downloadPdfFile = async (ticketId: any) => {
  const response = await getTicketOrderById(ticketId);
  if (!response) return;
  const qrCodeBase64 = await setQrCode(response.id);
  const formattedDate = `${new Date(
    response.date,
  ).toLocaleDateString()} - ${new Date(response.date).getHours()}:${String(
    new Date(response.date).getMinutes(),
  ).padStart(2, "0")}hs.`;
  // Crear PDF
  const doc = new jsPDF();
  doc.addImage(
    "data:image/png;base64,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",
    "PNG",
    20,
    10,
    50,
    10,
  );
  // Texto principal
  doc.setFontSize(12);
  doc.text(`N.: ${String(response.code).padStart(5, "0") || "-"}`, 20, 30);
  doc.setFontSize(18);
  doc.text(`${response.event.title || "-"}`, 20, 40);

  doc.setFontSize(12);
  doc.text(`${response.order.ticketType.title || "-"}`, 20, 48);
  doc.text(`Fecha:  ${formattedDate}`, 20, 53);
  doc.text(`Dirección: ${response.event.address || "-"}`, 20, 58);
  doc.text(
    `Lugar: ${response.event.venue || response.event.city || "-"}`,
    20,
    63,
  );

  // Agregar imagen QR al PDF (posición x: 140, y: 30, tamaño: 50x50)
  doc.addImage(qrCodeBase64, "PNG", 20, 68, 40, 40);

  // Descargar PDF
  doc.save(`ticket-${ticketId}.pdf`);
};

export async function updateProducerDetailsAction(
  producerId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    state?: string;
    city?: string;
    website?: string;
    logo?: string;
    logoPublicId?: string | null;
  },
) {
  await updateProducer(producerId, data);
  revalidatePath("/dashboard/configuracion/productora");
}

export async function updateProducerConfigurationAction(
  producerId: string,
  data: {
    serviceCharge?: number;
    maxValidatorsPerEvent?: number;
    maxInvitesPerEvent?: number;
  },
) {
  await updateProducerConfiguration(producerId, data);
  revalidatePath("/dashboard/configuracion/productora");
}

// ─── TICKET STOCK ACTIONS ─────────────────────────────────────────────────────

export async function purchaseTicketPackageAction(
  producerId: string,
  quantity: number,
  notes?: string,
) {
  // Validar que las variables de MP estén configuradas antes de crear cualquier registro
  if (!process.env.MP_EYTICKETS_ACCESS_TOKEN) {
    throw new Error(
      "El sistema de pagos no está configurado. Contactá al administrador.",
    );
  }
  if (!process.env.MP_SITE_URL || !process.env.MP_SITE_URL.startsWith("http")) {
    throw new Error(
      "La URL del sitio no está configurada correctamente. Contactá al administrador.",
    );
  }

  // Calcular el precio server-side para evitar manipulación desde el cliente
  const unitPrice = getUnitPriceForQuantity(quantity);

  // Crear el paquete en estado PENDING antes de iniciar el pago
  const pkg = await TicketStock.createPendingTicketPackage({
    producerId,
    quantity,
    unitPrice,
    notes,
  });

  try {
    const totalPrice = quantity * unitPrice;
    const checkoutUrl = await createStockPurchasePreference(
      pkg.id,
      quantity,
      totalPrice,
    );
    return checkoutUrl;
  } catch {
    // Si falla la creación de la preferencia, eliminar el paquete pendiente
    await prisma.ticketPackage.delete({ where: { id: pkg.id } });
    throw new Error("No se pudo iniciar el proceso de pago. Intentá de nuevo.");
  }
}

export async function assignMemberAllocationAction(
  producerId: string,
  userId: string,
  quantity: number,
) {
  await TicketStock.upsertMemberTicketAllocation({
    producerId,
    userId,
    quantity,
  });
  revalidatePath("/dashboard/ticket-stock");
}

export async function getSoldTicketCountsByTypeAction(eventId: string) {
  return TicketOrders.getSoldTicketCountsByType(eventId);
}

export async function getSoldTicketsPaginatedAction(
  eventId: string,
  page: number,
  pageSize: number,
  search?: string,
  onlyInvitations?: boolean,
  excludeInvitations?: boolean,
) {
  return TicketOrders.getSoldTicketsPaginated(eventId, {
    page,
    pageSize,
    search,
    onlyInvitations,
    excludeInvitations,
  });
}

export async function getAllTicketsForExportAction(eventId: string) {
  return TicketOrders.getAllTicketsForExport(eventId);
}

export async function removeMemberAllocationAction(userId: string) {
  await TicketStock.removeMemberTicketAllocation(userId);
  revalidatePath("/dashboard/ticket-stock");
}

export async function getActiveFeaturedEvents() {
  return getActiveFeaturedEventsForCarousel();
}
