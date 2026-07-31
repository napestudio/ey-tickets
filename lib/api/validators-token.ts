import { CreateValidatorSessionInput, ValidatorSession } from "@/types/validators";
import { prisma } from "../prisma";
import {
  getCachedSession,
  invalidateCachedSession,
  setCachedSession,
} from "../cache/session-cache";

export async function createValidatorToken(data: {
  token: string;
  notes?: string | null;
  endDate?: Date | null;
  eventId: string;
}) {
  return await prisma.validatorToken.create({ data });
}

export async function getTokensByEvent(eventId: string) {
  return await prisma.validatorToken.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function deleteTokenById(tokenId: string) {
  return await prisma.validatorToken.delete({
    where: { id: tokenId },
  });
}

export async function updateValidatorToken(
  tokenId: string,
  data: { notes?: string | null; isActive?: boolean }
) {
  return await prisma.validatorToken.update({
    where: { id: tokenId },
    data,
  });
}

export async function getEventByToken(token: string) {
  return await prisma.validatorToken.findUnique({
    where: { token },
  });
}

export async function createValidatorSession(
  input: CreateValidatorSessionInput
): Promise<ValidatorSession> {
  const session = await prisma.validatorSession.create({
    data: {
      validatorTokenId: input.validatorTokenId,
      eventId: input.eventId,
      token: input.token,
      expiresAt: input.expiresAt,
      isActive: true,
      ipAddress: input.ipAddress,
      userAgent: input.deviceData.userAgent,
      platform: input.deviceData.platform,
      screenResolution: input.deviceData.screenResolution,
      timezone: input.deviceData.timezone,
      language: input.deviceData.language,
    },
  });

  setCachedSession(session.id, {
    isActive: session.isActive,
    expiresAt: session.expiresAt,
    eventId: session.eventId,
  });

  return session;
}

export async function getActiveSession(
  sessionId: string
): Promise<ValidatorSession | null> {
  const cached = getCachedSession(sessionId);
  if (cached) {
    if (!cached.isActive || cached.expiresAt <= new Date()) return null;
    return { id: sessionId, eventId: cached.eventId } as ValidatorSession;
  }

  const session = await prisma.validatorSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
  });

  if (session) {
    setCachedSession(session.id, {
      isActive: session.isActive,
      expiresAt: session.expiresAt,
      eventId: session.eventId,
    });
  }

  return session;
}

export async function expireSession(sessionId: string): Promise<void> {
  await prisma.validatorSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
  invalidateCachedSession(sessionId);
}

export async function getSessionsByEvent(eventId: string) {
  return await prisma.validatorSession.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      validatorToken: {
        select: { id: true, token: true, notes: true },
      },
      _count: {
        select: { validationEvents: true },
      },
    },
  });
}
