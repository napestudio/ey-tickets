import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPendingTransferOrdersAction } from "@/lib/actions";
import TransferOrdersTable from "./transfer-orders-table";

export default async function TransferOrdersTab({
  eventId,
}: {
  eventId: string;
}) {
  const orders = await getPendingTransferOrdersAction(eventId);

  return (
    <Card className="max-w-[90vw]">
      <CardHeader>
        <CardTitle>Transferencias pendientes</CardTitle>
        <CardDescription>
          Confirmá el pago una vez que recibas el comprobante del comprador
          para emitir sus entradas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransferOrdersTable eventId={eventId} orders={orders} />
      </CardContent>
    </Card>
  );
}
