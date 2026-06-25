import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "secondary" | "destructive" | "outline" }
> = {
  ACTIVE: { label: "Activo", variant: "secondary" },
  DRAFT: { label: "Borrador", variant: "outline" },
  CONCLUDED: { label: "Finalizado", variant: "outline" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
};

interface EventDetailHeaderProps {
  eventTitle: string;
  eventStatus: string;
}

export default function EventDetailHeader({
  eventTitle,
  eventStatus,
}: EventDetailHeaderProps) {
  const statusInfo = STATUS_MAP[eventStatus] ?? {
    label: eventStatus,
    variant: "outline" as const,
  };

  return (
    <div className="flex flex-col gap-3">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link href="/dashboard/reportes">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a reportes
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{eventTitle}</h2>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>
    </div>
  );
}
