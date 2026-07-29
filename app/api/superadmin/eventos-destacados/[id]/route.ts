import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { updateFeaturedEvent } from "@/lib/api/superadmin/featured-events";
import { UpdateFeaturedEventInput } from "@/types/superadmin";

const VALID_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body: UpdateFeaturedEventInput = await req.json();
    const { position, startDate, endDate, status, price, notes } = body;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      position !== undefined &&
      (!Number.isInteger(position) || position < 1)
    ) {
      return NextResponse.json(
        { error: "position debe ser un entero mayor a 0" },
        { status: 400 }
      );
    }

    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { error: "price no puede ser negativo" },
        { status: 400 }
      );
    }

    const updated = await updateFeaturedEvent(id, {
      position,
      startDate,
      endDate,
      status,
      price,
      notes,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Evento destacado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ featuredEvent: updated });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as Error & { status: number }).status }
      );
    }
    console.error("[superadmin/eventos-destacados/[id]] PATCH", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
