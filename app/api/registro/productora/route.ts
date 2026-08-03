import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendEmailVerificationEmail } from "@/emails/send";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { producer, owner } = body;

    if (!producer?.name || !producer?.email || !owner?.name || !owner?.email || !owner?.password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!producer?.eventCategories || producer.eventCategories.length === 0) {
      return NextResponse.json(
        { error: "Debés seleccionar al menos un tipo de evento" },
        { status: 400 }
      );
    }

    // Verificar email de productora no existe
    const existingProducer = await prisma.producer.findUnique({
      where: { email: producer.email },
    });
    if (existingProducer) {
      return NextResponse.json(
        { error: "Ya existe una productora con ese email" },
        { status: 400 }
      );
    }

    // Verificar email de usuario no existe
    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 400 }
      );
    }

    const slug = producer.slug ?? generateSlug(producer.name);
    const hashedPassword = await bcrypt.hash(owner.password, 10);

    await prisma.$transaction(async (tx) => {
      // Crear productora
      const newProducer = await tx.producer.create({
        data: {
          name: producer.name,
          slug,
          email: producer.email,
          phone: producer.phone ?? null,
          state: producer.state ?? null,
          city: producer.city ?? null,
          venueType: producer.venueType ?? null,
          eventCategories: producer.eventCategories ?? [],
          createdFrom: "WEBSITE",
        },
      });

      // Crear configuración de la productora
      await tx.producerConfiguration.create({
        data: { producerId: newProducer.id },
      });

      // Crear usuario owner
      const newUser = await tx.user.create({
        data: {
          name: owner.name,
          email: owner.email,
          password: hashedPassword,
          isSuperAdmin: false,
        },
      });

      // Crear membresía como OWNER
      await tx.producerMember.create({
        data: {
          userId: newUser.id,
          producerId: newProducer.id,
          role: "OWNER",
        },
      });

      // Crear configuración personal del usuario
      await tx.userConfiguration.create({
        data: { userId: newUser.id },
      });
    });

    // Generar token de verificación (24h) y enviar email fuera de la transacción
    try {
      const verificationToken = uuidv4();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: { email: owner.email, token: verificationToken, expires },
      });

      await sendEmailVerificationEmail({
        recipientEmail: owner.email,
        verificationToken,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // El registro ya fue creado; el superadmin puede verificar manualmente
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error registering producer:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
