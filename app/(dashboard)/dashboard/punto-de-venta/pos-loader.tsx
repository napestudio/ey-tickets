import PaymentMethodsTable from "@/components/dashboard/payment-methods-table";
import {
  getPaymentMethodsByProducerId,
  getPaymentMethodsByCreatorId,
  getUsersByType,
} from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { Session } from "next-auth";
import Box from "@/components/dashboard/box";

export default async function PosLoader({
  session,
  producerId,
}: {
  producerId: string;
  session: Session;
}) {
  const sellers = await getUsersByType(producerId, "SELLER");
  const { id, isSuperAdmin, role } = session.user;

  let allMethods;

  if (isSuperAdmin || isOrgAdmin(role)) {
    allMethods = await getPaymentMethodsByProducerId(producerId);
  } else {
    allMethods = await getPaymentMethodsByCreatorId(id);
  }

  const methods = (allMethods ?? []).filter((m) => m.type === "CASH");

  if (!methods.length) {
    return <Box>No hay Puntos de Venta creados</Box>;
  }

  return (
    <PaymentMethodsTable methods={methods} sellers={sellers} />
  );
}
