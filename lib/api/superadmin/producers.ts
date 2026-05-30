import { prisma } from "@/lib/prisma";
import { ProducerDetail, ProducerSummary } from "@/types/superadmin";

export async function getSuperadminProducers(): Promise<ProducerSummary[]> {
  const producers = await prisma.producer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: { events: true },
      },
    },
  });

  return producers.map((p) => ({
    id: p.id,
    name: p.name,
    eventCount: p._count.events,
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
          endDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!producer) return null;

  return producer;
}
