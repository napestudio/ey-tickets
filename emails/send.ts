import fs from "fs";
import nodePath from "path";
import { Resend } from "resend";
import { SITE_NAME } from "@/lib/constants";
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

// Inline attachment type — Resend supports content_id for embedded images
// even though it's not reflected in the SDK's TypeScript types.
type InlineAttachment = {
  content: Buffer;
  filename: string;
  content_id: string;
  content_type: string;
};

function buildLogoAttachment(): InlineAttachment | null {
  try {
    const logoPath = nodePath.join(process.cwd(), "public", "email-logo.png");
    const content = fs.readFileSync(logoPath);
    return {
      content,
      filename: "email-logo.png",
      content_id: "email-logo",
      content_type: "image/png",
    };
  } catch {
    return null;
  }
}

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

  const attachments: InlineAttachment[] = [];

  const logo = buildLogoAttachment();
  if (logo) attachments.push(logo);

  const ticketsForTemplate = tickets.map((ticket) => ({
    ...ticket,
    qrSrc: `${process.env.BASE_URL}/api/tickets/qr/${ticket.ticketId}`,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachments: attachments as any,
  });

  if (error) {
    throw new Error(`Error sending ticket email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  payload: PasswordResetEmailPayload
): Promise<void> {
  const { recipientEmail, resetToken } = payload;

  const attachments: InlineAttachment[] = [];
  const logo = buildLogoAttachment();
  if (logo) attachments.push(logo);

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [recipientEmail],
    subject: `Recuperar contraseña de ${SITE_NAME}`,
    react: PasswordResetEmail({ resetToken }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachments: attachments as any,
  });

  if (error) {
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
}

export async function sendInvitationEmail(
  payload: InvitationEmailPayload
): Promise<void> {
  const { recipientEmail, roleLabel, invitationId, invitationToken } = payload;

  const attachments: InlineAttachment[] = [];
  const logo = buildLogoAttachment();
  if (logo) attachments.push(logo);

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [recipientEmail],
    subject: `Invitación a ${SITE_NAME}`,
    react: UserInvitationEmail({ roleLabel, invitationId, invitationToken }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachments: attachments as any,
  });

  if (error) {
    throw new Error(`Error sending invitation email: ${error.message}`);
  }
}
