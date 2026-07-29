import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import {
  createFeaturedEvent,
  getFeaturedEvents,
} from "@/lib/api/superadmin/featured-events";
import { CreateFeaturedEventInput } from "@/types/superadmin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  try {
    const featuredEvents = await getFeaturedEvents();
    return NextResponse.json({ featuredEvents });
  } catch (error) {
    console.error("[superadmin/eventos-destacados] GET", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  try {
    const body: CreateFeaturedEventInput = await req.json();
    const { eventId, position, startDate, endDate, price, notes } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId es requerido" },
        { status: 400 }
      );
    }

    if (!position || !Number.isInteger(position) || position < 1) {
      return NextResponse.json(
        { error: "position debe ser un entero mayor a 0" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate y endDate son requeridos" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || price < 0) {
      return NextResponse.json(
        { error: "price es requerido y no puede ser negativo" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const featured = await createFeaturedEvent({
      eventId,
      position,
      startDate,
      endDate,
      price,
      notes,
    });

    return NextResponse.json({ featuredEvent: featured }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as Error & { status: number }).status }
      );
    }
    console.error("[superadmin/eventos-destacados] POST", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
