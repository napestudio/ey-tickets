"use client";

import { useRef, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useVenueEditorStore } from "./use-venue-editor-store";
import { VenueElementNode } from "./venue-element-node";
import { VenueTransformOverlay } from "./venue-transform-overlay";

const CELL_SIZE = 40;

interface VenueMapEditorCanvasProps {
  onElementDoubleClick: (localId: string) => void;
}

export function VenueMapEditorCanvas({
  onElementDoubleClick,
}: VenueMapEditorCanvasProps) {
  const {
    elements,
    sectors,
    gridWidth,
    gridHeight,
    selectedId,
    selectElement,
    moveElement,
    removeElement,
  } = useVenueEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!selectedId) return;
      e.preventDefault();
      removeElement(selectedId);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, removeElement]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragStart(_event: DragStartEvent) {
    setIsDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const { active, delta } = event;
    const localId = active.id as string;
    const element = elements.find((el) => el.localId === localId);
    if (!element) return;

    const rawX = element.x + delta.x / CELL_SIZE;
    const rawY = element.y + delta.y / CELL_SIZE;

    const snappedX = Math.round(rawX);
    const snappedY = Math.round(rawY);

    const clampedX = Math.max(0, Math.min(snappedX, gridWidth - 1));
    const clampedY = Math.max(0, Math.min(snappedY, gridHeight - 1));

    moveElement(localId, clampedX, clampedY);
  }

  const canvasWidth = gridWidth * CELL_SIZE;
  const canvasHeight = gridHeight * CELL_SIZE;

  const selectedElement = elements.find((el) => el.localId === selectedId);

  return (
    <div className="flex-1 overflow-auto bg-zinc-900 p-4">
      <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
        >
        <div
          ref={canvasRef}
          className="relative border border-zinc-700 rounded-md"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            backgroundColor: "#18181b",
          }}
          onClick={() => selectElement(null)}
        >
          {elements.map((element) => (
            <VenueElementNode
              key={element.localId}
              element={element}
              sectors={sectors}
              cellSize={CELL_SIZE}
              isSelected={selectedId === element.localId}
              onSelect={() => selectElement(element.localId)}
              onEdit={() => {
                selectElement(element.localId);
                onElementDoubleClick(element.localId);
              }}
            />
          ))}

          {/* Row labels — rendered at exact canvas-space positions so they
              move with the element but never rotate, regardless of angle.
              Position computed by rotating the point (0, -14) around the
              row's CSS transformOrigin (left, top + rowHeight/2). */}
          {!isDragging && elements
            .filter((el) => el.type === "ROW" && el.rowLabel)
            .map((el) => {
              const spacing = el.seatSpacing ?? 40;
              const seatCount = el.seatCount ?? 10;
              const rowWidth = seatCount * spacing;
              const rowHeight = spacing + 4; // matches venue-element-row: (spacing-4)+8
              const rotRad = ((el.rotation ?? 0) * Math.PI) / 180;
              const pivotX = el.x * CELL_SIZE;
              const pivotY = el.y * CELL_SIZE + rowHeight / 2;
              const d = rowWidth + 8; // distance from pivot along row axis to label
              const labelX = pivotX + d * Math.cos(rotRad);
              const labelY = pivotY + d * Math.sin(rotRad);
              const sector = sectors.find((s) => s.localId === el.sectorId);
              return (
                <div
                  key={`label-${el.localId}`}
                  style={{
                    position: "absolute",
                    left: labelX,
                    top: labelY - 5, // offset half font-size to center vertically
                    fontSize: 10,
                    color: sector?.color ?? "#9ca3af",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 15,
                  }}
                >
                  {el.rowLabel}
                </div>
              );
            })}

          {/* Transform overlay for selected element — hidden while dragging */}
          {selectedElement && !isDragging && (
            <VenueTransformOverlay
              element={selectedElement}
              cellSize={CELL_SIZE}
              canvasRef={canvasRef}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
}
