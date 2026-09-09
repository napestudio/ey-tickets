import { prisma } from "../prisma";
import { VenueElement, VenueSector } from "@/types/venue";

export async function getVenuesByProducerId(producerId: string) {
  return await prisma.venue.findMany({
    where: { producerId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { elements: true, sectors: true, eventVenues: true } },
    },
  });
}

export async function getVenueById(venueId: string) {
  return await prisma.venue.findUnique({
    where: { id: venueId },
    include: {
      sectors: { orderBy: { position: "asc" } },
      elements: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createVenue(data: {
  name: string;
  producerId: string;
  description?: string;
  widthCells?: number;
  heightCells?: number;
}) {
  return await prisma.venue.create({ data });
}

export async function updateVenue(
  venueId: string,
  data: Partial<{
    name: string;
    description: string;
    widthCells: number;
    heightCells: number;
  }>
) {
  return await prisma.venue.update({ where: { id: venueId }, data });
}

/**
 * Replaces all sectors and elements for a venue atomically.
 * sectors and elements are passed together. sectorId on elements may reference
 * an existing sector db id; we preserve the mapping via the sectors array order.
 */
export async function saveVenueMap(
  venueId: string,
  sectors: VenueSector[],
  elements: VenueElement[]
) {
  await prisma.$transaction(async (tx) => {
    // 1. Delete existing elements first (they reference sectors via FK)
    await tx.venueElement.deleteMany({ where: { venueId } });

    // 2. Delete existing sectors
    await tx.venueSector.deleteMany({ where: { venueId } });

    // 3. Re-create sectors, build old-id → new-id map
    const oldIdToNewId: Record<string, string> = {};
    for (const [idx, sector] of sectors.entries()) {
      const created = await tx.venueSector.create({
        data: {
          venueId,
          name: sector.name,
          color: sector.color,
          position: sector.position ?? idx,
        },
      });
      if (sector.id) oldIdToNewId[sector.id] = created.id;
    }

    // 4. Re-create elements, resolving sectorId through the map
    for (const element of elements) {
      const { id: _id, venueId: _vId, sectorId, ...rest } = element;
      await tx.venueElement.create({
        data: {
          ...rest,
          venueId,
          rotation: rest.rotation ?? 0,
          sectorId: sectorId ? (oldIdToNewId[sectorId] ?? sectorId) : null,
        },
      });
    }

    // 5. Touch venue updatedAt
    await tx.venue.update({ where: { id: venueId }, data: { updatedAt: new Date() } });
  });
}

export async function deleteVenue(venueId: string) {
  await prisma.venue.update({
    where: { id: venueId },
    data: { status: "ARCHIVED" },
  });
}

export async function getEventVenue(eventId: string) {
  return await prisma.eventVenue.findUnique({
    where: { eventId },
    include: {
      venue: {
        include: {
          sectors: { orderBy: { position: "asc" } },
          elements: { orderBy: { createdAt: "asc" } },
        },
      },
      mappings: {
        include: {
          venueSector: { select: { id: true, name: true, color: true } },
          ticketType: { select: { id: true, title: true, price: true } },
        },
      },
    },
  });
}

export async function assignVenueToEvent(eventId: string, venueId: string) {
  return await prisma.eventVenue.create({ data: { eventId, venueId } });
}

export async function updateEventSectorMappings(
  eventVenueId: string,
  mappings: Array<{ venueSectorId: string; ticketTypeId: string }>
) {
  await prisma.$transaction(async (tx) => {
    await tx.eventSectorMapping.deleteMany({ where: { eventVenueId } });
    if (mappings.length > 0) {
      await tx.eventSectorMapping.createMany({
        data: mappings.map((m) => ({ eventVenueId, ...m })),
      });
    }
  });
}

export async function removeVenueFromEvent(eventVenueId: string) {
  await prisma.eventVenue.delete({ where: { id: eventVenueId } });
}
