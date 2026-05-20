import { redirect } from "next/navigation";

export default async function TicketTypePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  redirect(`/dashboard/evento/${eventId}/edit?tab=tickets`);
}
