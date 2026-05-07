import Box from "@/components/dashboard/box";
import PaymentMethodsTable from "@/components/dashboard/payment-methods-table";
import {
  getPaymentMethodsByClientId,
  getPaymentMethodsByCreatorId,
  getUsersByType,
} from "@/lib/actions";
import { Session } from "next-auth";

export default async function PaymentMethodsLoader({
  session,
  eventId,
  clientId,
}: {
  eventId?: string;
  clientId: string;
  session: Session;
}) {
  const sellers = await getUsersByType(clientId, "SELLER");

  const { id, type } = session.user;

  let methods: any[];

  switch (type) {
    case "ADMIN":
    case "SUPERADMIN":
      methods = await getPaymentMethodsByClientId(clientId);
      break;
    case "PRODUCER":
      methods = await getPaymentMethodsByCreatorId(id);
      break;
    default:
      methods = await getPaymentMethodsByCreatorId(id);
      break;
  }

  if (!methods || methods.length === 0) {
    <Box>No hay Métodos de Pago creados</Box>;
  }
  return (
    <PaymentMethodsTable
      methods={methods}
      eventId={eventId}
      sellers={sellers}
    />
  );
}
