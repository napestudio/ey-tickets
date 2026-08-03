import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerificationTokenByToken } from "@/lib/api/verification-token";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/dashboard?verification=invalid", req.url)
    );
  }

  const verificationToken = await getVerificationTokenByToken(token);

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/dashboard?verification=invalid", req.url)
    );
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return NextResponse.redirect(
      new URL("/dashboard?verification=expired", req.url)
    );
  }

  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return NextResponse.redirect(
    new URL("/dashboard?verification=success", req.url)
  );
}
