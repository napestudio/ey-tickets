"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditorElement } from "@/types/venue";
import { cn } from "@/lib/utils";

const ELEMENT_LABELS: Record<string, string> = {
  STAGE: "Escenario",
  ENTRANCE: "Entrada",
  EXIT: "Salida",
  TEXT: "T",
};

const ELEMENT_COLORS: Record<string, string> = {
  STAGE: "#8b5cf6",
  ENTRANCE: "#10b981",
  EXIT: "#ef4444",
  TEXT: "#6b7280",
};

interface VenueElementBlockProps {
  element: EditorElement;
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export function VenueElementBlock({
  element,
  cellSize,
  isSelected,
  onSelect,
  onEdit,
}: VenueElementBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: element.localId });

  const rotation = element.rotation ?? 0;
  const bgColor = element.color ?? ELEMENT_COLORS[element.type] ?? "#6b7280";
  const dragTranslate = CSS.Translate.toString(transform) ?? "";

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: element.x * cellSize,
        top: element.y * cellSize,
        width: element.width * cellSize,
        height: element.height * cellSize,
        transform: `${dragTranslate} rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
        opacity: isDragging ? 0.8 : 1,
      }}
      className={cn(
        "rounded-md border-2 cursor-grab active:cursor-grabbing select-none overflow-hidden",
        isSelected ? "border-white ring-2 ring-white/50" : "border-transparent",
      )}
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
      <div
        className="w-full h-full flex items-center justify-center px-1"
        style={{ backgroundColor: bgColor + "cc" }}
      >
        <span className="text-white font-semibold text-xs leading-tight truncate w-full text-center drop-shadow">
          {element.label ?? ELEMENT_LABELS[element.type] ?? element.type}
        </span>
      </div>
    </div>
  );
}
