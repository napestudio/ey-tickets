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

  if (order.customizedAt) {
    return (
      <div>
        <Title className="mb-4">
          Invitaciones - {order.event.title}
        </Title>
        <p className="text-sm text-muted-foreground mb-8">
          Esta invitación fue personalizada por el invitado el{" "}
          {new Date(order.customizedAt).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          y no puede modificarse.
        </p>
        <div className="grid gap-2 text-sm max-w-sm">
          <div className="flex justify-between border-b py-1">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">
              {order.name} {order.lastName}
            </span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-muted-foreground">DNI</span>
            <span className="font-medium">{order.dni}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{order.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Entradas</span>
            <span className="font-medium">{order.quantity}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title className="mb-10">Editar invitaciones - {order.event.title}</Title>
      <TicketBulkEditForm tickets={order.tickets} />
    </div>
  );
}
