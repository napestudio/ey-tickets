import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Evento } from "@/types/event";
import { SITE_URL } from "@/lib/constants";
import { datesFormater } from "@/lib/utils";
import { ArrowLeft, Eye, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import CancelEventButton from "../cancel-event-button";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: {
    label: "Activo",
    color: "bg-cyan-500/20 text-green-700 hover:bg-green-500/20",
  },
  CONCLUDED: {
    label: "Finalizado",
    color: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20",
  },
  CANCELED: {
    label: "Cancelado",
    color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
  },
  DRAFT: {
    label: "Borrador",
    color: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/20",
  },
};

interface EventOverviewHeaderProps {
  evento: Evento;
  isEventOwner: boolean;
}

export default function EventOverviewHeader({
  evento,
  isEventOwner,
}: EventOverviewHeaderProps) {
  const statusInfo = evento.status ? STATUS_MAP[evento.status] : null;
  const dates = datesFormater(evento.dates as string);

  return (
    <div className="space-y-4">
      <div className="flex items-start md:items-center justify-between gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/eventos">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden ml-4 md:inline-block">
              Volver a Eventos
            </span>
          </Link>
        </Button>

        <div className="md:ml-auto flex flex-wrap items-center gap-2">
          {evento.status !== "CANCELED" && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`${SITE_URL}/eventos/${evento.slug}`}
                className="flex items-center"
                target="_blank"
              >
                <Eye className="md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ver en la web</span>
              </Link>
            </Button>
          )}
          {isEventOwner && evento.status !== "CANCELED" && (
            <CancelEventButton id={evento.id} />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-5xl">
            {evento.title}
          </h1>
          {statusInfo && (
            <Badge className={statusInfo.color} variant="secondary">
              {statusInfo.label}
            </Badge>
          )}
          {evento.eventType === "PRIVATE" && (
            <Badge
              variant="secondary"
              className="bg-violet-500/20 text-violet-700 hover:bg-violet-500/20 flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              Privado
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          {dates && <span>{dates}</span>}
          {evento.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {evento.address}
              {evento.venue && ` | ${evento.venue}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
