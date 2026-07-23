import { Evento } from "@/types/event";
import PaymentMethodsList from "../payment-methods-list";
import { Session } from "next-auth";
import AssignPaymentMethodDialog from "./assign-payment-method-dialog";
import Box from "@/components/dashboard/box";
import {
  getPaymentMethodsByProducerId,
  getPaymentMethodsByCreatorId,
} from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";

interface PaymentMethodsTabProps {
  evento: Evento;
  session: Session;
}

export default async function PaymentMethodsTab({
  evento,
  session,
}: PaymentMethodsTabProps) {
  if (!evento.producerId) return null;

  const { id, isSuperAdmin, role } = session.user;

  const allMethods =
    isSuperAdmin || isOrgAdmin(role)
      ? await getPaymentMethodsByProducerId(evento.producerId)
      : await getPaymentMethodsByCreatorId(id);

  const assignedIds = new Set(
    evento.eventPayments?.map((ep) => ep.paymentMethodId) ?? []
  );
  const availableMethods = allMethods ?? [];

  const hasAssigned = evento.eventPayments && evento.eventPayments.length > 0;

  return (
    <div className="flex flex-col max-w-[90vw] gap-5">
      {hasAssigned ? (
        <PaymentMethodsList methods={evento.eventPayments!} />
      ) : (
        <Box>No hay métodos de pago asignados a este evento.</Box>
      )}
      <AssignPaymentMethodDialog
        methods={availableMethods}
        eventId={evento.id}
        assignedIds={assignedIds}
      />
    </div>
  );
}
