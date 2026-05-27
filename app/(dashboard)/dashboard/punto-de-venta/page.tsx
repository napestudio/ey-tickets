import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddPuntoDeVentaDialog } from "@/components/dashboard/add-punto-de-venta-dialog";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getUsersByType } from "@/lib/actions";
import { getServerSession } from "next-auth";
import PosLoader from "./pos-loader";

export default async function PuntoDeVentaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.producerId) return;
  const sellers = await getUsersByType(session.user.producerId, "SELLER");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Punto de venta"
          subtitle="Administra los puntos de venta y sus vendedores asignados"
        />
      </div>
      <div className="w-full space-y-5">
        <AddPuntoDeVentaDialog sellers={sellers} session={session} />
        <div className="max-w-[95vw]">
          <PosLoader producerId={session.user.producerId} session={session} />
        </div>
      </div>
    </div>
  );
}
