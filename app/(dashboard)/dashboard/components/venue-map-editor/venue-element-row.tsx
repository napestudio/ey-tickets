"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditorElement, EditorSector } from "@/types/venue";

function generatePreviewNumbers(
  startNumber: number,
  seatCount: number,
  seatPattern: "ALL" | "ODD" | "EVEN",
  orderDirection: "ASC" | "DESC",
): number[] {
  const result: number[] = [];
  let n = startNumber;
  while (result.length < seatCount) {
    const include =
      seatPattern === "ALL" ||
      (seatPattern === "ODD" && n % 2 !== 0) ||
      (seatPattern === "EVEN" && n % 2 === 0);
    if (include) result.push(n);
    n++;
    if (n > startNumber + seatCount * 3) break;
  }
  return orderDirection === "DESC" ? result.reverse() : result;
}

interface VenueElementRowProps {
  element: EditorElement;
  sectors: EditorSector[];
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export function VenueElementRow({
  element,
  sectors,
  isSelected,
  onSelect,
  onEdit,
}: VenueElementRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: element.localId });

  const rotation = element.rotation ?? 0;
  const sector = sectors.find((s) => s.localId === element.sectorId);
  const sectorColor = sector?.color ?? "#6b7280";

  const seatCount = element.seatCount ?? 10;
  const spacing = element.seatSpacing ?? 28;
  const circleSize = spacing - 4;
  const rowWidth = seatCount * spacing;
  const rowHeight = circleSize + 8;

  const numbers = generatePreviewNumbers(
    element.startNumber ?? 1,
    seatCount,
    (element.seatPattern ?? "ALL") as "ALL" | "ODD" | "EVEN",
    (element.orderDirection ?? "ASC") as "ASC" | "DESC",
  );

  const dragTranslate = CSS.Translate.toString(transform) ?? "";

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: element.x * 40,
        top: element.y * 40,
        width: rowWidth,
        height: rowHeight,
        transform: `${dragTranslate} rotate(${rotation}deg)`,
        transformOrigin: "0 50%",
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
        opacity: isDragging ? 0.8 : 1,
        cursor: "grab",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      {...listeners}
      {...attributes}
    >
      {/* Seat icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: rowHeight,
          gap: spacing - circleSize,
        }}
      >
        {numbers.map((num, i) => {
          const numStr = String(num);
          const fontSize =
            numStr.length >= 3 ? 5.5 : numStr.length === 2 ? 7 : 8.5;
          const strokeColor = element.sectorId
            ? sectorColor
            : "rgba(255,255,255,0.65)";
          return (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              style={{ width: circleSize, height: circleSize, flexShrink: 0 }}
            >
              <title>{`${element.rowLabel ?? ""}-${num}`}</title>
              <path
                fill="none"
                stroke={strokeColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                transform="rotate(180 12 12)"
                d="M19.5 7h-15c.588-2.35 2.7-4 5.123-4h4.754A5.28 5.28 0 0 1 19.5 7M18 16.5V7h2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-3 0M6 19V7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2m-3-2.5V8a1 1 0 0 1 1-1h2v9.5a1.5 1.5 0 0 1-3 0"
              />
              {circleSize >= 14 && (
                <text
                  x="12"
                  y="13"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                  style={{ userSelect: "none" }}
                >
                  {num}
                </text>
              )}
            </svg>
          );
        })}
      </div>

      {/* Row label rendered outside this component in canvas space — see venue-map-editor-canvas.tsx */}
    </div>
  );
}
