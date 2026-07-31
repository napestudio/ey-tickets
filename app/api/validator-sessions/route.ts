import { NextRequest, NextResponse } from "next/server";
import {
  createValidatorSession,
  getEventByToken,
} from "@/lib/api/validators-token";
import { ValidatorSessionDeviceData } from "@/types/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { token, eventId, deviceData } = body as {
    token: string;
    eventId: string;
    deviceData: ValidatorSessionDeviceData;
  };

  if (!token || !eventId) {
    return NextResponse.json(
      { error: "Token y eventId son requeridos" },
      { status: 400 }
    );
  }

  const validatorToken = await getEventByToken(token.toUpperCase());

  if (!validatorToken || validatorToken.eventId !== eventId) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  if (validatorToken.endDate && validatorToken.endDate < new Date()) {
    return NextResponse.json({ error: "Token expirado" }, { status: 401 });
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    null;

  // Session expires at token endDate or 12h from now, whichever is sooner
  const twelveHours = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const expiresAt = validatorToken.endDate
    ? new Date(
        Math.min(validatorToken.endDate.getTime(), twelveHours.getTime())
      )
    : twelveHours;

  const session = await createValidatorSession({
    validatorTokenId: validatorToken.id,
    eventId,
    token: validatorToken.token,
    expiresAt,
    ipAddress,
    deviceData: {
      userAgent: deviceData?.userAgent ?? null,
      platform: deviceData?.platform ?? null,
      screenResolution: deviceData?.screenResolution ?? null,
      timezone: deviceData?.timezone ?? null,
      language: deviceData?.language ?? null,
    },
  });

  return NextResponse.json({
    sessionId: session.id,
    expiresAt: session.expiresAt,
  });
}
