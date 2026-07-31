import NewTokenDialog from "@/app/(dashboard)/dashboard/components/new-token-dialog/new-token-dialog";
import ValidatorsTable from "@/app/(dashboard)/dashboard/components/validators-table/validators-table";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getEventById, getTokensByEvent } from "@/lib/actions";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function Validators({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evento, tokens] = await Promise.all([
    getEventById(id),
    getTokensByEvent(id),
  ]);

  if (!evento) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader title={evento.title} subtitle="Tokens de validadores" />
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/evento/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al evento
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/validar/${id}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ir a validar
          </Link>
        </Button>
        <NewTokenDialog eventId={id} />
      </div>
      <ValidatorsTable tokens={tokens ?? []} eventId={id} />
    </div>
  );
}
