import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { updateProducerStatus } from "@/lib/api/superadmin/producers";
import { ProducerStatus } from "@prisma/client";

const VALID_STATUSES: ProducerStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "IN_DEBT",
  "DELETED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status as ProducerStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    const producer = await updateProducerStatus(id, status as ProducerStatus);
    return NextResponse.json({ producer });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as Error & { status?: number }).status === 404
    ) {
      return NextResponse.json(
        { error: "Productora no encontrada" },
        { status: 404 }
      );
    }
    console.error("[superadmin/productoras/[id]/status]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
