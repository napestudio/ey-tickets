import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSuperadminRequest } from "@/lib/api/superadmin/auth";
import { getVerificationTokenByEmail } from "@/lib/api/verification-token";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSuperadminRequest(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const ownerMember = await prisma.producerMember.findFirst({
      where: { producerId: id, role: "OWNER" },
      include: { user: { select: { id: true, email: true, emailVerified: true } } },
    });

    if (!ownerMember) {
      return NextResponse.json(
        { error: "No se encontró el owner de la productora" },
        { status: 404 }
      );
    }

    if (ownerMember.user.emailVerified) {
      return NextResponse.json({
        alreadyVerified: true,
        userId: ownerMember.user.id,
        emailVerified: ownerMember.user.emailVerified,
      });
    }

    await prisma.user.update({
      where: { id: ownerMember.user.id },
      data: { emailVerified: new Date() },
    });

    const existingToken = await getVerificationTokenByEmail(ownerMember.user.email!);
    if (existingToken) {
      await prisma.verificationToken.delete({ where: { id: existingToken.id } });
    }

    return NextResponse.json({
      success: true,
      userId: ownerMember.user.id,
      emailVerified: new Date(),
    });
  } catch (error) {
    console.error("[superadmin/productoras/[id]/verify-email]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
