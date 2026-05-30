import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { getSuperadminProducerById } from "@/lib/api/superadmin/producers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const producer = await getSuperadminProducerById(id);

    if (!producer) {
      return NextResponse.json(
        { error: "Productora no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ producer });
  } catch (error) {
    console.error("[superadmin/productoras/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
