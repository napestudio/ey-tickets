import { Button } from "@/components/ui/button";
import { Evento } from "@/types/event";
import { ArrowLeft, Eye, Globe } from "lucide-react";
import Link from "next/link";
import CancelEventButton from "../cancel-event-button";
import { SITE_URL } from "@/lib/constants";

interface NavigationProps {
  evento: Evento;
  isEventOwner: boolean;
}

export default function Navigation({ evento, isEventOwner }: NavigationProps) {
  return (
    <>
      <div className="flex items-start md:items-center flex-wrap  gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Eventos
          </Link>
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {evento.status !== "CANCELED" && (
            <Button variant="outline" size="sm">
              <Link
                href={`${SITE_URL}/eventos/${evento.id}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver en la web
              </Link>
            </Button>
          )}
          {isEventOwner && (
            <>
              {evento.status !== "CANCELED" && (
                <CancelEventButton id={evento.id} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
