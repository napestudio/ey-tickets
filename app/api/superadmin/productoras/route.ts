import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { getSuperadminProducers } from "@/lib/api/superadmin/producers";

export async function GET(req: NextRequest) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  try {
    const producers = await getSuperadminProducers();
    return NextResponse.json({ producers });
  } catch (error) {
    console.error("[superadmin/productoras]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
