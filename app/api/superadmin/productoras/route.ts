import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import {
  createSuperadminProducer,
  getSuperadminProducers,
} from "@/lib/api/superadmin/producers";
import { CreateProducerInput } from "@/types/superadmin";

export async function GET(req: NextRequest) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  try {
    const producers = await getSuperadminProducers();
    return NextResponse.json({ producers });
  } catch (error) {
    console.error("[superadmin/productoras] GET", error);
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
    const body: CreateProducerInput = await req.json();
    const { producer, owner } = body;

    if (
      !producer?.name ||
      !producer?.email ||
      !owner?.name ||
      !owner?.email ||
      !owner?.password
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!producer.eventCategories || producer.eventCategories.length === 0) {
      return NextResponse.json(
        { error: "Debés incluir al menos un tipo de evento" },
        { status: 400 }
      );
    }

    const result = await createSuperadminProducer(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[superadmin/productoras] POST", error);

    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as Error & { status: number }).status }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
