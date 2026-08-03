import { prisma } from "@/lib/prisma";
import {
  EventCategory,
  Prisma,
  ProducerStatus,
  VenueType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CreateProducerInput,
  CreateProducerResult,
  ProducerDetail,
  ProducerSummary,
  TicketTypeSummary,
} from "@/types/superadmin";
import { getProducerStockSummary } from "@/lib/api/ticket-stock";
import { WELCOME_TICKET_PACKAGE_QUANTITY } from "@/lib/constants";

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
  input: CreateProducerInput,
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

    // Paquete de bienvenida
    await tx.ticketPackage.create({
      data: {
        producerId: newProducer.id,
        quantity: WELCOME_TICKET_PACKAGE_QUANTITY,
        unitPrice: new Prisma.Decimal(0),
        totalPrice: new Prisma.Decimal(0),
        status: "ACTIVE",
        paymentStatus: "PAID",
        notes: "Regalo de bienvenida",
      },
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
  const [producers, allTicketTypeUsage, memberAllocGroups] = await Promise.all([
    prisma.producer.findMany({
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
          where: { status: "ACTIVE", paymentStatus: "PAID" },
          select: { quantity: true },
        },
      },
    }),
    prisma.ticketType.findMany({
      where: { NOT: { status: "DELETED" } },
      select: {
        quantity: true,
        event: { select: { producerId: true } },
      },
    }),
    prisma.memberTicketAllocation.groupBy({
      by: ["producerId"],
      _sum: { quantity: true },
    }),
  ]);

  const ticketTypeUsageMap = new Map<string, number>();
  for (const tt of allTicketTypeUsage) {
    const pid = tt.event.producerId;
    ticketTypeUsageMap.set(
      pid,
      (ticketTypeUsageMap.get(pid) ?? 0) + tt.quantity,
    );
  }

  const memberAllocMap = new Map<string, number>();
  for (const alloc of memberAllocGroups) {
    memberAllocMap.set(alloc.producerId, alloc._sum.quantity ?? 0);
  }

  return producers.map((p) => {
    const totalPool = p.ticketPackages.reduce(
      (sum, pkg) => sum + pkg.quantity,
      0,
    );
    const usedByTicketTypes = ticketTypeUsageMap.get(p.id) ?? 0;
    const allocatedToMembers = memberAllocMap.get(p.id) ?? 0;
    const availableTickets = totalPool - usedByTicketTypes - allocatedToMembers;

    return {
      id: p.id,
      name: p.name,
      logo: p.logo,
      createdAt: p.createdAt,
      createdFrom: p.createdFrom,
      status: p.status,
      eventCount: p._count.events,
      totalPool,
      availableTickets,
    };
  });
}

export async function getSuperadminProducerById(
  id: string,
): Promise<ProducerDetail | null> {
  const [producer, ticketTypesRaw, stockSummary] = await Promise.all([
    prisma.producer.findUnique({
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
    }),
    prisma.ticketType.findMany({
      where: {
        NOT: { status: "DELETED" },
        event: { producerId: id },
      },
      select: {
        id: true,
        title: true,
        eventId: true,
        quantity: true,
        status: true,
        position: true,
        event: { select: { title: true } },
      },
      orderBy: [{ event: { startDate: "desc" } }, { position: "asc" }],
    }),
    getProducerStockSummary(id),
  ]);

  if (!producer) return null;

  const ticketTypeIds = ticketTypesRaw.map((tt) => tt.id);
  const soldCountGroups =
    ticketTypeIds.length > 0
      ? await prisma.order.groupBy({
          by: ["ticketTypeId"],
          where: {
            ticketTypeId: { in: ticketTypeIds },
            status: "PAID",
            isInvitation: false,
          },
          _sum: { quantity: true },
        })
      : [];

  const soldMap = new Map<string, number>();
  for (const sc of soldCountGroups) {
    if (sc.ticketTypeId) {
      soldMap.set(sc.ticketTypeId, sc._sum.quantity ?? 0);
    }
  }

  const ticketTypes: TicketTypeSummary[] = ticketTypesRaw.map((tt) => ({
    id: tt.id,
    title: tt.title,
    eventId: tt.eventId,
    eventTitle: tt.event.title,
    quantity: tt.quantity,
    soldCount: soldMap.get(tt.id) ?? 0,
    status: tt.status,
  }));

  return {
    ...producer,
    ticketPackages: producer.ticketPackages.map((p) => ({
      ...p,
      unitPrice: p.unitPrice.toNumber(),
      totalPrice: p.totalPrice.toNumber(),
    })),
    ticketTypes,
    stockSummary,
  };
}

export async function updateProducerStatus(
  id: string,
  status: ProducerStatus,
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
