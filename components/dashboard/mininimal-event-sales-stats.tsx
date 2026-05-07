import { getStats } from "@/lib/api/eventos";

export default async function MinimalEventSalesStats({
  eventId,
}: {
  eventId: string;
}) {
  const stats = await getStats({ eventId });

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Recaudación</h4>
      <p className="text-2xl font-bold">
        $ {stats.totalRevenue.toLocaleString("es-ar")}
      </p>
    </div>
  );
}
