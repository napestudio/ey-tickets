import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import {
  assignTicketsToEvent,
  getEventAllocations,
} from "@/lib/api/superadmin/tickets";
import { AssignTicketsInput } from "@/types/superadmin";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const producer = await prisma.producer.findUnique({ where: { id } });
    if (!producer) {
      return NextResponse.json(
        { error: "Productora no encontrada" },
        { status: 404 }
      );
    }

    const allocations = await getEventAllocations(id);
    return NextResponse.json({ allocations });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/asignar] GET", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const producer = await prisma.producer.findUnique({ where: { id } });
    if (!producer) {
      return NextResponse.json(
        { error: "Productora no encontrada" },
        { status: 404 }
      );
    }

    const body: AssignTicketsInput = await req.json();
    const { eventId, quantity } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "El campo eventId es requerido" },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, producerId: id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado o no pertenece a esta productora" },
        { status: 404 }
      );
    }

    const allocation = await assignTicketsToEvent(id, eventId, quantity);
    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/asignar] POST", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
