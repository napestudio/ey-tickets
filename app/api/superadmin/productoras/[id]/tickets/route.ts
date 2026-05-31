import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import {
  createTicketPackage,
  getTicketPackages,
} from "@/lib/api/superadmin/tickets";
import { CreateTicketPackageInput } from "@/types/superadmin";
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

    const packages = await getTicketPackages(id);
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/tickets] GET", error);
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

    const body: CreateTicketPackageInput = await req.json();
    const { quantity, unitPrice, totalPrice, expiresAt, notes } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (unitPrice === undefined || unitPrice < 0) {
      return NextResponse.json(
        { error: "El precio por ticket es inválido" },
        { status: 400 }
      );
    }

    if (totalPrice === undefined || totalPrice < 0) {
      return NextResponse.json(
        { error: "El precio total es inválido" },
        { status: 400 }
      );
    }

    const pkg = await createTicketPackage(id, {
      quantity,
      unitPrice,
      totalPrice,
      expiresAt,
      notes,
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/tickets] POST", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
