export function SeatMapLegend() {
  const items = [
    { color: "#22c55e", label: "Disponible" },
    { color: "#f59e0b", label: "Reservado" },
    { color: "#6b7280", label: "Vendido" },
    { color: "#3b82f6", label: "Tu selección" },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
