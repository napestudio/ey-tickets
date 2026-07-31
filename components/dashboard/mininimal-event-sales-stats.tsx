import { getStats } from "@/lib/api/eventos";
import { formatPrice } from "@/lib/utils";

export default async function MinimalEventSalesStats({
  eventId,
}: {
  eventId: string;
}) {
  const stats = await getStats({ eventId });

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Ingresos a la fecha</h4>
      <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
    </div>
  );
}
