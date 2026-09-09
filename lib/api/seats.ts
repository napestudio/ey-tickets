import { prisma } from "../prisma";
import { SeatPattern, SeatOrder } from "@/types/venue";
import { Prisma } from "@prisma/client";

function generateSeatNumbers(
  start: number,
  count: number,
  pattern: SeatPattern,
  order: SeatOrder
): number[] {
  const result: number[] = [];
  let n = start;
  while (result.length < count) {
    const include =
      pattern === "ALL" ||
      (pattern === "ODD" && n % 2 !== 0) ||
      (pattern === "EVEN" && n % 2 === 0);
    if (include) result.push(n);
    n++;
  }
  return order === "DESC" ? result.reverse() : result;
}

export async function generateSeatsForEventVenue(
  eventVenueId: string
): Promise<{ created: number }> {
  const existing = await prisma.seat.count({ where: { eventVenueId } });
  if (existing > 0) {
    throw new Error(
      "Los asientos ya fueron generados. Eliminá los existentes primero."
    );
  }

  const eventVenue = await prisma.eventVenue.findUniqueOrThrow({
    where: { id: eventVenueId },
    include: {
      mappings: true,
      venue: {
        include: {
          elements: {
            where: { type: { in: ["ROW", "TABLE"] }, sectorId: { not: null } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  const sectorToTicket = new Map<string, string>();
  for (const m of eventVenue.mappings) {
    sectorToTicket.set(m.venueSectorId, m.ticketTypeId);
  }

  const seatData: Prisma.SeatCreateManyInput[] = [];

  for (const element of eventVenue.venue.elements) {
    if (!element.sectorId) continue;

    if (element.type === "ROW") {
      if (!element.rowLabel || !element.seatCount || element.seatCount <= 0) {
        continue;
      }

      const numbers = generateSeatNumbers(
        element.startNumber ?? 1,
        element.seatCount,
        (element.seatPattern ?? "ALL") as SeatPattern,
        (element.orderDirection ?? "ASC") as SeatOrder
      );

      for (const num of numbers) {
        seatData.push({
          eventVenueId,
          venueSectorId: element.sectorId,
          rowElementId: element.id,
          rowLabel: element.rowLabel,
          seatNumber: num,
          seatCode: `${element.rowLabel}-${num}`,
          status: "AVAILABLE",
        });
      }
    } else if (element.type === "TABLE") {
      if (!element.tableCapacity || element.tableCapacity <= 0) continue;

      const tableLabel = element.label ?? "Mesa";
      seatData.push({
        eventVenueId,
        venueSectorId: element.sectorId,
        rowElementId: element.id,
        rowLabel: tableLabel,
        seatNumber: 1,
        seatCode: tableLabel,
        tableCapacity: element.tableCapacity,
        status: "AVAILABLE",
      });
    }
  }

  await prisma.seat.createMany({ data: seatData });

  // Sync TicketType.quantity per sector
  const sectorIds = [
    ...new Set(
      eventVenue.venue.elements
        .filter((e) => e.sectorId)
        .map((e) => e.sectorId!)
    ),
  ];
  for (const sectorId of sectorIds) {
    const ticketTypeId = sectorToTicket.get(sectorId);
    if (!ticketTypeId) continue;
    const count = await prisma.seat.count({
      where: { eventVenueId, venueSectorId: sectorId },
    });
    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { quantity: count },
    });
  }

  return { created: seatData.length };
}

export async function deleteSeatsByEventVenue(
  eventVenueId: string
): Promise<void> {
  const soldExists = await prisma.seat.findFirst({
    where: { eventVenueId, status: "SOLD" },
  });
  if (soldExists) {
    throw new Error(
      "No se pueden eliminar asientos vendidos. Cancelá las entradas primero."
    );
  }
  await prisma.seat.deleteMany({ where: { eventVenueId } });
}

export async function getSeatsByEventVenueGrouped(eventVenueId: string) {
  const eventVenue = await prisma.eventVenue.findUniqueOrThrow({
    where: { id: eventVenueId },
    include: {
      venue: {
        include: {
          sectors: { orderBy: { position: "asc" } },
          elements: {
            where: { type: { in: ["ROW", "TABLE"] } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      mappings: {
        include: {
          ticketType: { select: { id: true, title: true, price: true } },
        },
      },
      seats: { orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }] },
    },
  });

  return eventVenue.venue.sectors.map((sector) => {
    const mapping = eventVenue.mappings.find(
      (m) => m.venueSectorId === sector.id
    );
    const sectorSeats = eventVenue.seats.filter(
      (s) => s.venueSectorId === sector.id
    );
    const sectorElements = eventVenue.venue.elements.filter(
      (e) => e.sectorId === sector.id
    );

    const rowMap = new Map<string, typeof sectorSeats>();
    for (const seat of sectorSeats) {
      if (!rowMap.has(seat.rowLabel)) rowMap.set(seat.rowLabel, []);
      rowMap.get(seat.rowLabel)!.push(seat);
    }

    return {
      sectorId: sector.id,
      label: sector.name,
      color: sector.color,
      elements: sectorElements.map((e) => ({
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        rotation: e.rotation ?? 0,
        label: e.label,
        rowLabel: e.rowLabel,
        seatCount: e.seatCount,
        seatSpacing: e.seatSpacing ?? 28,
        tableCapacity: e.tableCapacity,
      })),
      ticketTypeId: mapping?.ticketTypeId ?? null,
      ticketTypeTitle: mapping?.ticketType.title ?? null,
      ticketTypePrice: mapping ? Number(mapping.ticketType.price) : null,
      rows: Array.from(rowMap.entries()).map(([rowLabel, seats]) => ({
        rowLabel,
        seats,
      })),
    };
  });
}

export async function holdSeat(seatId: string, durationMinutes = 10) {
  const heldUntil = new Date(Date.now() + durationMinutes * 60 * 1000);

  // Atomic conditional UPDATE: only succeeds if the seat is AVAILABLE or its hold has expired.
  // This prevents the TOCTOU race condition where two concurrent requests both read
  // status=AVAILABLE and both proceed to hold the same seat.
  const result = await prisma.seat.updateMany({
    where: {
      id: seatId,
      OR: [
        { status: "AVAILABLE" },
        { status: "HELD", heldUntil: { lt: new Date() } },
      ],
    },
    data: { status: "HELD", heldUntil },
  });

  if (result.count === 0) {
    throw new Error("El asiento no está disponible.");
  }

  return await prisma.seat.findUniqueOrThrow({ where: { id: seatId } });
}

export async function releaseSeat(seatId: string): Promise<void> {
  await prisma.seat.update({
    where: { id: seatId },
    data: { status: "AVAILABLE", heldUntil: null },
  });
}

export async function sellSeat(seatId: string, ticketOrderId: string) {
  // Atomic conditional UPDATE: only succeeds if the seat is still HELD.
  // Prevents a race where an expired hold gets overwritten by a concurrent purchase.
  const result = await prisma.seat.updateMany({
    where: { id: seatId, status: "HELD" },
    data: { status: "SOLD", ticketOrderId, heldUntil: null },
  });

  if (result.count === 0) {
    throw new Error(
      "El asiento debe estar reservado antes de marcarlo como vendido."
    );
  }

  return await prisma.seat.findUniqueOrThrow({ where: { id: seatId } });
}

export async function releaseExpiredHolds(): Promise<number> {
  const result = await prisma.seat.updateMany({
    where: { status: "HELD", heldUntil: { lt: new Date() } },
    data: { status: "AVAILABLE", heldUntil: null },
  });
  return result.count;
}

export async function blockSeat(seatId: string) {
  return await prisma.seat.update({
    where: { id: seatId },
    data: { status: "BLOCKED" },
  });
}

export async function unblockSeat(seatId: string) {
  return await prisma.seat.update({
    where: { id: seatId },
    data: { status: "AVAILABLE" },
  });
}

export async function getSeatCountBySector(
  eventVenueId: string,
  venueSectorId: string
): Promise<number> {
  return await prisma.seat.count({ where: { eventVenueId, venueSectorId } });
}
