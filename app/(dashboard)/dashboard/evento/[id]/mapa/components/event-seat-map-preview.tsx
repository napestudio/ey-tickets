"use client";

import { EventVenue } from "@/types/venue";

const CELL_SIZE = 14;
const CIRCLE_SIZE = 8;

interface EventSeatMapPreviewProps {
  eventVenue: EventVenue;
}

export function EventSeatMapPreview({ eventVenue }: EventSeatMapPreviewProps) {
  const sectors = eventVenue.venue?.sectors ?? [];
  const elements = eventVenue.venue?.elements ?? [];
  const mappings = eventVenue.mappings ?? [];

  if (elements.length === 0 && sectors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        La sala no tiene elementos diseñados.
      </p>
    );
  }

  const allX = elements.map((e) => e.x);
  const allY = elements.map((e) => e.y);
  const maxX = allX.length > 0 ? Math.max(...allX) + 10 : 30;
  const maxY = allY.length > 0 ? Math.max(...allY) + 6 : 20;

  const canvasWidth = maxX * CELL_SIZE;
  const canvasHeight = maxY * CELL_SIZE;

  // Map sectorId → color (from mappings or from sector itself)
  const sectorColorMap = new Map<string, string>(
    sectors.map((s) => [s.id!, s.color])
  );

  return (
    <div className="overflow-auto">
      <div
        className="relative rounded border bg-zinc-900"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: 200,
          minHeight: 100,
        }}
      >
        {elements.map((element, i) => {
          const rotation = element.rotation ?? 0;

          if (element.type === "ROW") {
            const seatCount = element.seatCount ?? 8;
            const sectorColor = element.sectorId
              ? (sectorColorMap.get(element.sectorId) ?? "#6b7280")
              : "#6b7280";
            const spacing = Math.max(
              CIRCLE_SIZE + 1,
              ((element.seatSpacing ?? 28) * CELL_SIZE) / 40
            );
            const rowWidth = seatCount * spacing;

            return (
              <div
                key={element.id ?? i}
                style={{
                  position: "absolute",
                  left: element.x * CELL_SIZE,
                  top: element.y * CELL_SIZE,
                  width: rowWidth,
                  height: CIRCLE_SIZE + 2,
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "0 50%",
                  display: "flex",
                  alignItems: "center",
                  gap: spacing - CIRCLE_SIZE,
                }}
              >
                {Array.from({ length: Math.min(seatCount, 30) }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: CIRCLE_SIZE,
                      height: CIRCLE_SIZE,
                      borderRadius: "50%",
                      backgroundColor: sectorColor,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            );
          }

          // Non-ROW elements
          const bgColors: Record<string, string> = {
            STAGE: "#8b5cf6cc",
            TABLE: element.sectorId
              ? (sectorColorMap.get(element.sectorId) ?? "#f59e0b") + "cc"
              : "#f59e0bcc",
            ENTRANCE: "#10b981cc",
            EXIT: "#ef4444cc",
            TEXT: "#6b7280cc",
          };
          const bg = bgColors[element.type] ?? "#6b728099";

          return (
            <div
              key={element.id ?? i}
              className="absolute rounded text-white flex flex-col items-center justify-center overflow-hidden"
              style={{
                left: element.x * CELL_SIZE,
                top: element.y * CELL_SIZE,
                width: element.width * CELL_SIZE,
                height: element.height * CELL_SIZE,
                backgroundColor: bg,
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
                transformOrigin: "center center",
              }}
            >
              <span
                className="text-center leading-tight font-medium px-0.5 truncate w-full"
                style={{ fontSize: Math.max(6, CELL_SIZE * 0.45) }}
              >
                {element.label}
              </span>
            </div>
          );
        })}

        {/* Sector legend */}
        {sectors.length > 0 && (
          <div
            style={{ position: "absolute", bottom: 4, left: 4, display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {sectors.map((s) => {
              const mapping = mappings.find((m) => m.venueSectorId === s.id);
              return (
                <div
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: 3 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: s.color,
                    }}
                  />
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
                    {s.name}
                    {mapping?.ticketType && ` · ${mapping.ticketType.title}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
