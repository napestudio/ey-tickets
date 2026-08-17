import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface SerializedTicket {
  id: string;
  code: number | null;
  date: string; // ISO string
}

interface CustomizationConfirmViewProps {
  order: {
    name: string | null;
    lastName: string | null;
    dni: string | null;
    email: string | null;
    quantity: number;
    customizedAt: string; // ISO string
    tickets: SerializedTicket[];
    event: { title: string };
    ticketType: { title: string };
  };
}

export function CustomizationConfirmView({
  order,
}: CustomizationConfirmViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-bold">
            Tu invitación fue registrada exitosamente
          </h1>
          <p className="text-muted-foreground">{order.event.title}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tus datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">
                {order.name} {order.lastName}
              </span>

              <span className="text-muted-foreground">DNI</span>
              <span className="font-medium">{order.dni}</span>

              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{order.email}</span>

              <span className="text-muted-foreground">Tipo de entrada</span>
              <span className="font-medium">{order.ticketType.title}</span>

              <span className="text-muted-foreground">Cantidad</span>
              <span className="font-medium">
                {order.quantity} entrada{order.quantity !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tus entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col items-center gap-3 py-3 border-b last:border-0"
                  >
                    <div className="flex justify-between w-full text-sm">
                      <span className="text-muted-foreground">
                        {new Date(ticket.date).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-mono font-medium">
                        #{String(ticket.code ?? 0).padStart(5, "0")}
                      </span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/tickets/qr/${ticket.id}`}
                      alt={`QR entrada #${String(ticket.code ?? 0).padStart(5, "0")}`}
                      className="w-48 h-48"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
