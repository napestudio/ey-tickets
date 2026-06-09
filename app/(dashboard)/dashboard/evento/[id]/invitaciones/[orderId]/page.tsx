import { TicketBulkEditForm } from "@/components/dashboard/ticket-bulk-edit-form";
import { Title } from "@/components/website/ui/Title";
import { getOrderWithTickets } from "@/lib/api/orders";

export default async function Invitations({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderWithTickets(orderId);
  if (!order) return null;

  return (
    <div>
      <Title className="mb-10">Editar invitaciones - {order?.event.title}</Title>
      <TicketBulkEditForm tickets={order.tickets} />
    </div>
  );
}
