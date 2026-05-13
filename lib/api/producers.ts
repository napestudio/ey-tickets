import { prisma } from "../prisma";

export async function getProducerById(producerId: string) {
  return await prisma.producer.findUnique({
    where: { id: producerId },
    include: { configuration: true },
  });
}

export async function getProducerBySlug(slug: string) {
  return await prisma.producer.findUnique({
    where: { slug },
    include: { configuration: true },
  });
}

export async function getAllProducers() {
  return await prisma.producer.findMany({
    orderBy: { createdAt: "desc" },
    include: { configuration: true },
  });
}

export interface CreateProducerData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  city?: string;
  logo?: string;
  website?: string;
}

export async function createProducer(data: CreateProducerData) {
  return await prisma.$transaction(async (tx) => {
    const producer = await tx.producer.create({ data });
    await tx.producerConfiguration.create({
      data: { producerId: producer.id },
    });
    return producer;
  });
}

export async function updateProducer(
  producerId: string,
  data: Partial<CreateProducerData>
) {
  return await prisma.producer.update({
    where: { id: producerId },
    data,
  });
}

export async function getProducerConfiguration(producerId: string) {
  return await prisma.producerConfiguration.findUnique({
    where: { producerId },
  });
}

export async function updateProducerConfiguration(
  producerId: string,
  data: {
    serviceCharge?: number;
    maxValidatorsPerEvent?: number;
    maxInvitesPerEvent?: number;
    maxTicketsPerEvent?: number;
  }
) {
  return await prisma.producerConfiguration.upsert({
    where: { producerId },
    create: { producerId, ...data },
    update: data,
  });
}
