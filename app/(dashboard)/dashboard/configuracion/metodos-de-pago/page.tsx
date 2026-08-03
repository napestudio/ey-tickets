import { getSession } from "@/lib/auth/get-session";
import { AddPaymentMethodDialog } from "@/components/dashboard/add-payment-method-dialog";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import PaymentMethodsLoader from "./methods-loader";

export default async function PaymentMethodsPage() {
  const session = await getSession();
  if (!session?.user.producerId) return;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Métodos de pago"
          subtitle="Administra los métodos de pago de tus eventos"
        />
      </div>
      <div className="w-full space-y-5">
        {!session.user.emailVerified ? (
          <div className="text-sm text-neutral-700">
            Tu cuenta tiene que estar verificada para poder agregar medios de
            pagos y comenzar a vender entradas.
          </div>
        ) : (
          <AddPaymentMethodDialog session={session} />
        )}
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
