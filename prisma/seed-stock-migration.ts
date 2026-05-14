/**
 * Script one-shot para migrar los datos legacy de maxTicketsPerEvent
 * a registros de TicketPackage.
 *
 * Ejecutar UNA SOLA VEZ con:
 *   pnpm tsx prisma/seed-stock-migration.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const producers = await prisma.producer.findMany({
    include: { configuration: true },
  });

  let migrated = 0;

  for (const producer of producers) {
    const max = producer.configuration?.maxTicketsPerEvent ?? 0;
    if (max <= 0) continue;

    // Verificar que no tenga ya paquetes (evitar duplicados si se corre dos veces)
    const existing = await prisma.ticketPackage.count({
      where: { producerId: producer.id },
    });

    if (existing > 0) {
      console.log(
        `[SKIP] ${producer.name} ya tiene paquetes, omitiendo migración.`
      );
      continue;
    }

    await prisma.ticketPackage.create({
      data: {
        producerId: producer.id,
        quantity: max,
        unitPrice: new Prisma.Decimal(0),
        totalPrice: new Prisma.Decimal(0),
        status: "ACTIVE",
        notes: "Migrado desde maxTicketsPerEvent",
      },
    });

    console.log(
      `[OK] ${producer.name}: ${max} tickets migrados como paquete legacy.`
    );
    migrated++;
  }

  console.log(`\nMigración completada. ${migrated} productoras migradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
