import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { adjustProducerStock } from "@/lib/api/superadmin/tickets";
import { getProducerStockSummary } from "@/lib/api/ticket-stock";
import { AdjustProducerStockInput } from "@/types/superadmin";
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

    const stockSummary = await getProducerStockSummary(id);
    return NextResponse.json({ stockSummary });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/stock] GET", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  let body: { action?: unknown; quantity?: unknown; reason?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { action, quantity, reason } = body;

  if (!action || !["add", "remove", "set"].includes(action as string)) {
    return NextResponse.json(
      { error: "El campo 'action' debe ser 'add', 'remove' o 'set'" },
      { status: 400 }
    );
  }

  if (
    quantity === undefined ||
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return NextResponse.json(
      { error: "El campo 'quantity' debe ser un entero positivo" },
      { status: 400 }
    );
  }

  if (reason !== undefined && typeof reason !== "string") {
    return NextResponse.json(
      { error: "El campo 'reason' debe ser un string" },
      { status: 400 }
    );
  }

  try {
    const producer = await prisma.producer.findUnique({ where: { id } });
    if (!producer) {
      return NextResponse.json(
        { error: "Productora no encontrada" },
        { status: 404 }
      );
    }

    const input: AdjustProducerStockInput = {
      action: action as "add" | "remove" | "set",
      quantity: quantity as number,
      reason: reason as string | undefined,
    };

    const result = await adjustProducerStock(id, input);
    return NextResponse.json({ result });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      typeof (error as Error & { status?: number }).status === "number"
    ) {
      const statusCode = (error as Error & { status: number }).status;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }
    console.error("[superadmin/productoras/[id]/stock] PATCH", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
