import { NextRequest, NextResponse } from "next/server";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { cancelTicketPackage } from "@/lib/api/superadmin/tickets";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id, packageId } = await params;

  try {
    const pkg = await cancelTicketPackage(id, packageId);

    if (!pkg) {
      return NextResponse.json(
        { error: "Paquete de tickets no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error(
      "[superadmin/productoras/[id]/tickets/[packageId]] PATCH",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
