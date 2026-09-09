"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditorElement, EditorSector } from "@/types/venue";
import { cn } from "@/lib/utils";

interface VenueElementTableProps {
  element: EditorElement;
  sectors: EditorSector[];
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export function VenueElementTable({
  element,
  sectors,
  cellSize,
  isSelected,
  onSelect,
  onEdit,
}: VenueElementTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: element.localId });

  const rotation = element.rotation ?? 0;
  const sector = sectors.find((s) => s.localId === element.sectorId);
  const sectorColor = sector?.color ?? "#f59e0b";
  const bgColor = element.sectorId ? sectorColor + "cc" : "#f59e0bcc";
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
        className="w-full h-full flex flex-col items-center justify-center gap-0.5 px-1"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-white font-semibold text-xs leading-tight truncate w-full text-center drop-shadow">
          {element.label ?? "Mesa"}
        </span>
        <span className="text-white/70 text-[9px] leading-none">
          {element.tableCapacity ?? 4} pers.
        </span>
        {sector && (
          <span className="text-white/60 text-[9px] leading-none">
            {sector.name}
          </span>
        )}
      </div>
    </div>
  );
}
