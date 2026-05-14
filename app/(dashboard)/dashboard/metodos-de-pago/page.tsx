import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddPaymentMethodDialog } from "@/components/dashboard/add-payment-method-dialog";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getUsersByType } from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { getServerSession } from "next-auth";
import PaymentMethodsLoader from "./methods-loader";
import { redirect } from "next/navigation";

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.producerId) return;
  if (!isOrgAdmin(session.user.role) && !session.user.isSuperAdmin) redirect("/dashboard");
  const sellers = await getUsersByType(session.user.producerId, "SELLER");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Métodos de pago"
          subtitle="Administra los métodos de pago de tus eventos"
        />
      </div>
      <div className="w-full space-y-5">
        <AddPaymentMethodDialog sellers={sellers} session={session} />
        <div className="max-w-[95vw]">
          <PaymentMethodsLoader
            producerId={session.user.producerId}
            session={session}
          />
        </div>
      </div>
    </div>
  );
}
