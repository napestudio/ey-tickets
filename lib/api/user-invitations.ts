import { UserInvitation } from "@/types/user-invitations";
import { prisma } from "../prisma";
import { sendInvitationEmail } from "@/emails/send";

const organizationRoleLabel: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SELLER: "Punto de Venta / Vendedor",
};

export async function createUserInvitation(data: UserInvitation) {
  const invitation = await prisma.invitation.create({ data: data as any });
  const roleLabel = organizationRoleLabel[data.role ?? ""] ?? data.role ?? "";

  await sendInvitationEmail({
    recipientEmail: data.email,
    roleLabel,
    invitationId: invitation.id,
    invitationToken: invitation.token,
  });

  return invitation;
}

export async function updateInvitationsById(
  data: Partial<UserInvitation>,
  invitationId: string
) {
  return await prisma.invitation.update({
    where: { id: invitationId },
    data: data as any,
  });
}

export async function getInvitationsByUser(userId: string) {
  return await prisma.invitation.findMany({
    where: { inviterId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingInvitationsByUser(userId: string) {
  return await prisma.invitation.findMany({
    where: { inviterId: userId, accepted: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvitationsById(invitationId: string) {
  return await prisma.invitation.findFirst({
    where: { id: invitationId },
  });
}

export async function getInvitationsByEmail(userEmail: string) {
  return await prisma.invitation.findFirst({
    where: { email: userEmail },
  });
}

export async function acceptInvitation(invitationId: string) {
  return await prisma.invitation.update({
    data: { accepted: true },
    where: { id: invitationId },
  });
}

export async function removeInvitationById(invitationId: string) {
  return await prisma.invitation.delete({
    where: { id: invitationId },
  });
}
