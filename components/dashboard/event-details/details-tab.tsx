import { EventDescription } from "@/components/dashboard/event-description";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento } from "@/types/event";
import DeleteEventButton from "../delete-event-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { datesFormater } from "@/lib/utils";

interface DetailsTabProps {
  evento: Evento;
  isSeller: boolean;
  isEventOwner: boolean;
}

export default function DetailsTab({
  evento,
  isSeller,
  isEventOwner,
}: DetailsTabProps) {
  const groupedDates = datesFormater(evento.dates as string);

  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: {
        label: "ACTIVO",
        color: "bg-cyan-500/20 text-green-700 hover:bg-green-500/20",
      },
      CONCLUDED: {
        label: "FINALIZADO",
        color: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20",
      },
      CANCELED: {
        label: "CANCELADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },
      DELETED: {
        label: "ELIMINADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },
      DEFAULT: { label: status, color: "" },
    };
    const { label, color } = statusMap[status] || statusMap.DEFAULT;
    return (
      <Badge className={color} variant="secondary">
        {label}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Descripción del evento</CardTitle>
        </CardHeader>
        <CardContent>
          <EventDescription html={evento.description} />

          {evento.status && (
            <div>
              <CardTitle>Estado</CardTitle>
              {renderStatusBadge(evento.status)}
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{groupedDates}</span>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Creado por</h4>
            <p className="text-sm">{evento.producer?.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Dirección</h4>
            <p className="text-sm">
              {evento.address} | {evento.location}
            </p>
          </div>
        </CardContent>
      </Card>
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Dirección</CardTitle>
          <CardDescription>
            {evento.location} | {evento.address}
          </CardDescription>
        </CardHeader>
      </Card> */}
      {!isSeller && isEventOwner && (
        <div className="pt-28">
          <Separator />
          <Card className="bg-black text-white">
            <CardHeader>
              <CardTitle>Eliminar evento permanentemente</CardTitle>
              <CardDescription className="text-white">
                Esta acción no se puede revertir. Por favor, asegúrate de que
                deseas eliminar este evento antes de continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteEventButton id={evento.id} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
