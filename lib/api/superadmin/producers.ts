import { prisma } from "@/lib/prisma";
import { ProducerSummary } from "@/types/superadmin";

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
