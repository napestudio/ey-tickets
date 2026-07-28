import { Resend } from "resend";
import { SITE_NAME, SITE_PROD_URL } from "@/lib/constants";
import { TicketConfirmationEmail } from "./ticket-confirmation";
import { PasswordResetEmail } from "./password-reset";
import { UserInvitationEmail } from "./user-invitation";

export type { QrTicketEmailData } from "./ticket-confirmation";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? `${SITE_NAME} <noreply@example.com>`;

export type TicketEmailPayload = {
  recipientEmail: string;
  eventTitle: string;
  eventLocation: string;
  eventAddress: string;
  tickets: import("./ticket-confirmation").QrTicketEmailData[];
};

export type PasswordResetEmailPayload = {
  recipientEmail: string;
  resetToken: string;
};

export type InvitationEmailPayload = {
  recipientEmail: string;
  roleLabel: string;
  invitationId: string;
  invitationToken: string;
};

export async function sendTicketConfirmationEmail(
  payload: TicketEmailPayload
): Promise<void> {
  const { recipientEmail, eventTitle, eventLocation, eventAddress, tickets } =
    payload;

  const ticketsForTemplate = tickets.map((ticket) => ({
    ...ticket,
    qrSrc: `${SITE_PROD_URL}/api/tickets/qr/${ticket.ticketId}`,
  }));

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [recipientEmail],
    subject: `Gracias por comprar en ${SITE_NAME}`,
    react: TicketConfirmationEmail({
      eventTitle,
      eventLocation,
      eventAddress,
      tickets: ticketsForTemplate,
    }),
  });

  if (error) {
    throw new Error(`Error sending ticket email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  payload: PasswordResetEmailPayload
): Promise<void> {
  const { recipientEmail, resetToken } = payload;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [recipientEmail],
    subject: `Recuperar contraseña de ${SITE_NAME}`,
    react: PasswordResetEmail({ resetToken }),
  });

  if (error) {
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
}

export async function sendInvitationEmail(
  payload: InvitationEmailPayload
): Promise<void> {
  const { recipientEmail, roleLabel, invitationId, invitationToken } = payload;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [recipientEmail],
    subject: `Invitación a ${SITE_NAME}`,
    react: UserInvitationEmail({ roleLabel, invitationId, invitationToken }),
  });

  if (error) {
    throw new Error(`Error sending invitation email: ${error.message}`);
  }
}
