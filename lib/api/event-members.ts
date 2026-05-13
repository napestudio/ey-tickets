import { EventRole } from "@/types/user";
import { prisma } from "../prisma";

export async function getEventMembers(eventId: string) {
  return await prisma.eventMember.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });
}

export async function assignUserToEvent(
  userId: string,
  eventId: string,
  role: EventRole
) {
  return await prisma.eventMember.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, role },
    update: { role },
  });
}

export async function removeUserFromEvent(userId: string, eventId: string) {
  return await prisma.eventMember.delete({
    where: { userId_eventId: { userId, eventId } },
  });
}

export async function getUserEventRole(
  userId: string,
  eventId: string
): Promise<EventRole | null> {
  const member = await prisma.eventMember.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { role: true },
  });
  return member?.role ?? null;
}

export async function getEventsByUserId(userId: string) {
  return await prisma.eventMember.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          discountCode: true,
          tickets: { select: { id: true } },
        },
      },
    },
  });
}
