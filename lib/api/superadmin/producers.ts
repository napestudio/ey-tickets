import { prisma } from "@/lib/prisma";
import { EventCategory, ProducerStatus, VenueType } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CreateProducerInput,
  CreateProducerResult,
  ProducerDetail,
  ProducerSummary,
} from "@/types/superadmin";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function createSuperadminProducer(
  input: CreateProducerInput
): Promise<CreateProducerResult> {
  const { producer, owner } = input;

  const existingProducer = await prisma.producer.findUnique({
    where: { email: producer.email },
  });
  if (existingProducer) {
    throw Object.assign(new Error("Ya existe una productora con ese email"), {
      status: 409,
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: owner.email },
  });
  if (existingUser) {
    throw Object.assign(new Error("Ya existe una cuenta con ese email"), {
      status: 409,
    });
  }

  const slug = generateSlug(producer.name);
  const hashedPassword = await bcrypt.hash(owner.password, 10);

  return prisma.$transaction(async (tx) => {
    const newProducer = await tx.producer.create({
      data: {
        name: producer.name,
        slug,
        email: producer.email,
        phone: producer.phone ?? null,
        venueType: producer.venueType
          ? (producer.venueType as VenueType)
          : null,
        eventCategories: producer.eventCategories
          ? (producer.eventCategories as EventCategory[])
          : [],
        createdFrom: "SUPERADMIN",
      },
      select: { id: true, name: true, slug: true, email: true },
    });

    await tx.producerConfiguration.create({
      data: { producerId: newProducer.id },
    });

    const newUser = await tx.user.create({
      data: {
        name: owner.name,
        email: owner.email,
        password: hashedPassword,
        isSuperAdmin: false,
      },
      select: { id: true, name: true, email: true },
    });

    await tx.producerMember.create({
      data: {
        userId: newUser.id,
        producerId: newProducer.id,
        role: "OWNER",
      },
    });

    await tx.userConfiguration.create({
      data: { userId: newUser.id },
    });

    return { producer: newProducer, owner: newUser };
  });
}

export async function getSuperadminProducers(): Promise<ProducerSummary[]> {
  const producers = await prisma.producer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      logo: true,
      createdAt: true,
      createdFrom: true,
      status: true,
      _count: {
        select: { events: true },
      },
      ticketPackages: {
        where: { status: "ACTIVE" },
        select: { quantity: true },
      },
    },
  });

  return producers.map((p) => ({
    id: p.id,
    name: p.name,
    logo: p.logo,
    createdAt: p.createdAt,
    createdFrom: p.createdFrom,
    status: p.status,
    eventCount: p._count.events,
    totalActiveTickets: p.ticketPackages.reduce(
      (sum, pkg) => sum + pkg.quantity,
      0
    ),
  }));
}

export async function getSuperadminProducerById(
  id: string
): Promise<ProducerDetail | null> {
  const producer = await prisma.producer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      state: true,
      city: true,
      logo: true,
      website: true,
      createdAt: true,
      updatedAt: true,
      createdFrom: true,
      status: true,
      members: {
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          startDate: true,
          saleEndDate: true,
          eventEndDate: true,
          createdAt: true,
        },
      },
      ticketPackages: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          status: true,
          paymentStatus: true,
          purchasedAt: true,
          expiresAt: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!producer) return null;

  return {
    ...producer,
    ticketPackages: producer.ticketPackages.map((p) => ({
      ...p,
      unitPrice: p.unitPrice.toNumber(),
      totalPrice: p.totalPrice.toNumber(),
    })),
  };
}

export async function updateProducerStatus(
  id: string,
  status: ProducerStatus
): Promise<{ id: string; name: string; status: ProducerStatus }> {
  const existing = await prisma.producer.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw Object.assign(new Error("Productora no encontrada"), { status: 404 });
  }

  const updated = await prisma.producer.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, status: true },
  });

  return updated;
}
