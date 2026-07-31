"use client";
import ExportEventAsPDF from "@/components/data-pdf";
import QrScannerComponent from "@/components/qr-scanner";
import { getValidatorStats, getEventTitle } from "@/lib/actions";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  ScanLine,
  Gift,
  BadgeCheck,
} from "lucide-react";
import SearchPanel from "./search-panel";

type ActiveView = "search" | "entries" | "invitations" | "validated-by-session";

type Stats = {
  validated: number;
  total: number;
  validatedBySession: number;
};

type EventInfoProps = {
  eventId: string;
  sessionId?: string;
};

function StatCard({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-1 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">
          {label}
        </span>
        {/* <span className="opacity-70">{icon}</span> */}
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

const VIEW_TITLES: Record<ActiveView, string> = {
  search: "Buscar entrada",
  entries: "Entradas vendidas",
  invitations: "Invitaciones",
  "validated-by-session": "Validadas por este token",
};

export default function EventInfo({ eventId, sessionId }: EventInfoProps) {
  const [eventTitle, setEventTitle] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeView, setActiveView] = useState<ActiveView | null>(null);

  const fetchStats = useCallback(async () => {
    if (!sessionId) return;
    const s = await getValidatorStats(eventId, sessionId);
    setStats(s);
  }, [eventId, sessionId]);

  useEffect(() => {
    void fetchStats();
    void getEventTitle(eventId).then((title) => setEventTitle(title ?? ""));
  }, [eventId, fetchStats]);

  const incrementValidated = useCallback(() => {
    setStats((prev) =>
      prev
        ? {
            ...prev,
            validated: prev.validated + 1,
            validatedBySession: prev.validatedBySession + 1,
          }
        : prev,
    );
  }, []);

  if (!stats) {
    return (
      <div className="p-6 text-center text-neutral-400">
        Cargando información del evento...
      </div>
    );
  }

  const pending = stats.total - stats.validated;

  return (
    <div className="w-full flex flex-col justify-between h-[95svh] text-neutral-50 pt-12">
      <div className="space-y-5">
        <div className="pt-6 px-4">
          {eventTitle && (
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {eventTitle}
            </h1>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 px-4">
          <StatCard
            label="Vendidas"
            value={stats.total}
            icon={<Ticket className="w-4 h-4" />}
            colorClass="bg-neutral-800 text-neutral-50 col-span-3"
          />
          <StatCard
            label="Ingresaron"
            value={stats.validated}
            icon={<CheckCircle2 className="w-4 h-4" />}
            colorClass="bg-ey-orange/60 text-emerald-100"
          />
          <StatCard
            label="Pendientes"
            value={pending}
            icon={<Clock className="w-4 h-4" />}
            colorClass="bg-red-900/60 text-amber-100"
          />
          <StatCard
            label="Validadas"
            value={stats.validatedBySession}
            icon={<ScanLine className="w-4 h-4" />}
            colorClass="bg-ey-turquoise-dark text-ey-turquoise-darker"
          />
        </div>

        <div className="flex flex-col gap-2 px-4">
          <ExportEventAsPDF
            eventTitle={eventTitle}
            eventId={eventId}
            sessionId={sessionId}
            quantity={stats.total}
            type="ESTADISTICAS"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 px-4 pb-20">
        {sessionId && (
          <Button
            variant="outline"
            className="w-full py-5 font-bold bg-neutral-50 text-neutral-900"
            onClick={() => setActiveView("search")}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar entrada
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="py-4 bg-neutral-950 border border-neutral-50"
            onClick={() => setActiveView("entries")}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Entradas
          </Button>
          <Button
            variant="outline"
            className="py-4 bg-neutral-950 border border-neutral-50"
            onClick={() => setActiveView("invitations")}
          >
            <Gift className="mr-2 h-4 w-4" />
            Invitaciones
          </Button>
        </div>

        {sessionId && (
          <Button
            variant="outline"
            className="w-full py-5 font-bold bg-ey-turquoise-dark text-ey-turquoise-darker border-0"
            onClick={() => setActiveView("validated-by-session")}
          >
            <BadgeCheck className="mr-2 h-4 w-4" />
            Validadas por este token
          </Button>
        )}
      </div>

      {/* Bottom sheet for all table views */}
      <Sheet
        open={activeView !== null}
        onOpenChange={(open) => {
          if (!open) setActiveView(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="dark h-svh bg-neutral-900 border-neutral-700 text-neutral-50 flex flex-col p-0"
        >
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-neutral-700 shrink-0">
            <SheetTitle className="text-neutral-50">
              {activeView ? VIEW_TITLES[activeView] : ""}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            {activeView === "search" && sessionId && (
              <SearchPanel
                eventId={eventId}
                sessionId={sessionId}
                onStatsUpdate={fetchStats}
              />
            )}

            {activeView === "entries" && (
              <SearchPanel
                eventId={eventId}
                sessionId={sessionId ?? ""}
                onStatsUpdate={fetchStats}
                excludeInvitations
                autoLoad
              />
            )}

            {activeView === "invitations" && (
              <SearchPanel
                eventId={eventId}
                sessionId={sessionId ?? ""}
                onStatsUpdate={fetchStats}
                onlyInvitations
                autoLoad
              />
            )}

            {activeView === "validated-by-session" && sessionId && (
              <SearchPanel
                eventId={eventId}
                sessionId={sessionId}
                onStatsUpdate={fetchStats}
                onlyValidatedBySession
                autoLoad
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* QR Scanner */}
      {sessionId && (
        <QrScannerComponent
          eventId={eventId}
          sessionId={sessionId}
          updateData={incrementValidated}
        />
      )}
    </div>
  );
}
