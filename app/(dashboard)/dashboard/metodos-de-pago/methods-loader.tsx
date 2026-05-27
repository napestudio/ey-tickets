import Box from "@/components/dashboard/box";
import PaymentMethodsTable from "@/components/dashboard/payment-methods-table";
import {
  getPaymentMethodsByProducerId,
  getPaymentMethodsByCreatorId,
  getUsersByType,
} from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { Session } from "next-auth";

export default async function PaymentMethodsLoader({
  session,
  eventId,
  producerId,
}: {
  eventId?: string;
  producerId: string;
  session: Session;
}) {
  const sellers = await getUsersByType(producerId, "SELLER");

  const { id, isSuperAdmin, role } = session.user;

  let methods;

  if (isSuperAdmin || isOrgAdmin(role)) {
    methods = await getPaymentMethodsByProducerId(producerId);
  } else {
    methods = await getPaymentMethodsByCreatorId(id);
  }

  // Exclude CASH (Punto de Venta) from the payment methods page — managed separately
  const filtered = eventId
    ? (methods ?? [])
    : (methods ?? []).filter((m) => m.type !== "CASH");

  if (!filtered.length) {
    return <Box>No hay Métodos de Pago creados</Box>;
  }

  return (
    <PaymentMethodsTable
      methods={filtered}
      eventId={eventId}
      sellers={sellers}
    />
  );
}
