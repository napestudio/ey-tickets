import { getInvitationByToken } from "@/lib/actions";
import { CustomizationForm } from "./customization-form";
import { CustomizationConfirmView } from "./customization-confirm-view";

interface CustomizationPageProps {
  params: Promise<{ token: string }>;
}

export default async function CustomizationPage({
  params,
}: CustomizationPageProps) {
  const { token } = await params;
  const order = await getInvitationByToken(token);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Invitación no encontrada</h1>
          <p className="text-muted-foreground">
            Este enlace es inválido o ya no está disponible.
          </p>
        </div>
      </div>
    );
  }

  // Serialize Prisma objects (Decimal, Date) to plain values
  // before passing to Client Components
  const serializedOrder = {
    name: order.name,
    lastName: order.lastName,
    dni: order.dni,
    email: order.email,
    quantity: order.quantity,
    customizedAt: order.customizedAt ? order.customizedAt.toISOString() : null,
    tickets: order.tickets.map((t) => ({
      id: t.id,
      code: t.code ?? null,
      date: t.date.toISOString(),
    })),
    event: { title: order.event.title },
    ticketType: { title: order.ticketType.title },
  };

  if (order.customizedAt) {
    return (
      <CustomizationConfirmView
        order={{
          ...serializedOrder,
          customizedAt: order.customizedAt.toISOString(),
        }}
      />
    );
  }

  return (
    <div className="pt-24">
      <CustomizationForm token={token} order={serializedOrder} />
    </div>
  );
}
