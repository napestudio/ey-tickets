import { UserInvitation } from "@/types/user-invitations";
import { prisma } from "../prisma";
import { sendEmail } from "../invitation-email";
import { SITE_NAME } from "../constants";

const organizationRoleLabel: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SELLER: "Punto de Venta / Vendedor",
};

export async function createUserInvitation(data: UserInvitation) {
  const invitation = await prisma.invitation.create({ data: data as any });
  const emailSubject = `Invitación a ${SITE_NAME}`;
  const roleLabel = organizationRoleLabel[data.role ?? ""] ?? data.role ?? "";
  const emailBody = `
  <div style="font-family: Inter, Helvetica, sans-serif; margin: 0;">      
    <div style="max-width:1400px;margin: 0 auto; background-color: #ffffff; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h1 style="font-weight: 400; color: #222222;">
          Invitación a <strong>${SITE_NAME}</strong>
        </h1>
      </div>
      <div style="padding: 20px; text-align: left">
        <p style="font-size: 1.1rem; line-height: 1.5; color: #222222;">
          Estimado/a, 
        </p>
        <p style="font-size: 1.1rem; line-height: 1.5; color: #222222;">
          Has sido invitado a unirte a nuestra plataforma con el rol de  
          <span style="letter-spacing: 1px; font-size: small; padding: .4rem .8rem; background: #019645; border-radius: 5rem; color: white; text-transform: uppercase;">
            ${roleLabel}
          </span>.
        </p>
        <p style="font-size: 1.1rem; line-height: 1.5; color: #222222;">
          Para completar tu registro y acceder a la plataforma, es necesario que leas y aceptes nuestros 
          <a href="${process.env.BASE_URL}terminos-y-condiciones" style="color: #0f172a; text-decoration: underline;">Términos y Condiciones de Uso</a>.
        </p>
        <p style="font-size: 1.1rem; line-height: 1.5; color: #222222;">
          Al hacer clic en el siguiente botón, confirmas que has leído y aceptas los Términos y Condiciones de Uso de ${SITE_NAME}.
        </p>
        <form
          action="${process.env.BASE_URL}/api/invitations/accept"
          method="POST"
          style="display: inline-block; margin-top: 20px;">
          <input type="hidden" name="id" value="${invitation.id}" />
          <input type="hidden" name="t" value="${invitation.token}" />
          <button
            type="submit"
            style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #0f172a; text-decoration: none; cursor: pointer; border-radius: .5rem; border: none;">
            Aceptar invitación y términos de uso
          </button>
        </form>
        <p style="font-size: 0.9rem; color: #6b7280; margin-top: 20px;">
          Si no reconoces esta invitación o no deseas unirte, simplemente ignora este mensaje. Para más información, puedes comunicarte con nuestro equipo de soporte.
        </p>
      </div>
    </div>
  </div>
`;

  await sendEmail(data.email, emailSubject, emailBody);

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
