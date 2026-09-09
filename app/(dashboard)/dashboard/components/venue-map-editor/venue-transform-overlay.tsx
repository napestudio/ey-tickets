"use client";

import { RotateCw, Maximize2 } from "lucide-react";
import { EditorElement } from "@/types/venue";
import { useVenueEditorStore } from "./use-venue-editor-store";

const BORDER_OFFSET = 4;
const LINE_HEIGHT = 16;
const HANDLE_SIZE = 18;
const MIN_SPACING = 16;
const MAX_SPACING = 120;

interface VenueTransformOverlayProps {
  element: EditorElement;
  cellSize: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function VenueTransformOverlay({
  element,
  cellSize,
  canvasRef,
}: VenueTransformOverlayProps) {
  const { rotateElement, updateRowConfig, resizeElement } =
    useVenueEditorStore();

  const rotation = element.rotation ?? 0;
  const isRow = element.type === "ROW";
  const canResize = !isRow; // TABLE, STAGE, TEXT, ENTRANCE, EXIT

  const spacing = element.seatSpacing ?? 40;
  const seatCount = element.seatCount ?? 10;
  const width = isRow ? seatCount * spacing : element.width * cellSize;
  // rowHeight must match venue-element-row: circleSize + 8 = (spacing - 4) + 8 = spacing + 4
  const height = isRow ? spacing + 4 : element.height * cellSize;
  const left = element.x * cellSize;
  const top = element.y * cellSize;
  const transformOrigin = isRow ? "0 50%" : "center center";

  // Pivot in canvas-local coordinates (matches CSS transformOrigin)
  const pivotX = isRow ? left : left + width / 2;
  const pivotY = top + height / 2;

  // ── Rotation handle ────────────────────────────────────────────────────────

  function handleRotationMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const startAngle =
      Math.atan2(
        e.clientY - rect.top - pivotY,
        e.clientX - rect.left - pivotX,
      ) *
      (180 / Math.PI);
    const startRotation = rotation;

    function onMouseMove(evt: MouseEvent) {
      const currentRect = canvas!.getBoundingClientRect();
      const dx = evt.clientX - currentRect.left - pivotX;
      const dy = evt.clientY - currentRect.top - pivotY;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const delta = currentAngle - startAngle;
      const newRotation =
        ((Math.round(startRotation + delta) % 360) + 360) % 360;
      rotateElement(element.localId, newRotation);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // ── Scale handle (ROW only) ─────────────────────────────────────────────

  function handleRowScaleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rotRad = (rotation * Math.PI) / 180;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);

    function onMouseMove(evt: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      const dx = mouseX - pivotX;
      const dy = mouseY - pivotY;
      const projectedWidth = dx * cosR + dy * sinR;

      const newSpacing = Math.round(
        Math.max(MIN_SPACING, Math.min(MAX_SPACING, projectedWidth / seatCount)),
      );
      updateRowConfig(element.localId, { seatSpacing: newSpacing });
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // ── Resize handle (block elements) ────────────────────────────────────────

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rotRad = (rotation * Math.PI) / 180;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);

    function onMouseMove(evt: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = evt.clientX - rect.left;
      const my = evt.clientY - rect.top;

      // Project mouse from pivot onto the element's local axes
      const dx = mx - pivotX;
      const dy = my - pivotY;
      const localX = dx * cosR + dy * sinR;  // along element's width axis
      const localY = -dx * sinR + dy * cosR; // along element's height axis

      // localX and localY are signed distances from center to mouse
      const newW = Math.max(1, Math.round((localX * 2) / cellSize));
      const newH = Math.max(1, Math.round((localY * 2) / cellSize));
      resizeElement(element.localId, newW, newH);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // Positions for rotation handle (above element, in local space)
  const lineTop = -(BORDER_OFFSET + LINE_HEIGHT);
  const handleTop = -(BORDER_OFFSET + LINE_HEIGHT + HANDLE_SIZE);
  const badgeTop = handleTop - 18;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      {/* Dashed bounding box */}
      <div
        style={{
          position: "absolute",
          inset: -BORDER_OFFSET,
          border: "1.5px dashed rgba(255,255,255,0.65)",
          borderRadius: 4,
          pointerEvents: "none",
        }}
      />

      {/* Rotation handle — all element types */}
      <>
        {/* Connector line */}
        <div
          style={{
            position: "absolute",
            top: lineTop,
            left: "50%",
            width: 1,
            height: LINE_HEIGHT,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(255,255,255,0.4)",
            pointerEvents: "none",
          }}
        />

        {/* Rotation circle handle */}
        <div
          style={{
            position: "absolute",
            top: handleTop,
            left: "50%",
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            border: "2px solid white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
            cursor: "grab",
          }}
          onMouseDown={handleRotationMouseDown}
          title="Arrastrar para rotar"
        >
          <RotateCw style={{ width: 9, height: 9, color: "white" }} />
        </div>

        {/* Degree badge */}
        {rotation !== 0 && (
          <div
            style={{
              position: "absolute",
              top: badgeTop,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              fontSize: 10,
              padding: "1px 5px",
              borderRadius: 3,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            {Math.round(rotation)}°
          </div>
        )}
      </>

      {/* Scale handle — right edge, ROW only */}
      {isRow && (
        <div
          style={{
            position: "absolute",
            right: -(BORDER_OFFSET + HANDLE_SIZE / 2),
            top: "50%",
            transform: "translateY(-50%)",
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: 4,
            backgroundColor: "#3b82f6",
            border: "2px solid white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
            cursor: "ew-resize",
          }}
          onMouseDown={handleRowScaleMouseDown}
          title="Arrastrar para escalar"
        >
          <Maximize2 style={{ width: 9, height: 9, color: "white" }} />
        </div>
      )}

      {/* Resize handle — bottom-right corner, block elements */}
      {canResize && (
        <div
          style={{
            position: "absolute",
            right: -(BORDER_OFFSET + HANDLE_SIZE / 2),
            bottom: -(BORDER_OFFSET + HANDLE_SIZE / 2),
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: 4,
            backgroundColor: "#3b82f6",
            border: "2px solid white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
            cursor: "nwse-resize",
          }}
          onMouseDown={handleResizeMouseDown}
          title="Arrastrar para redimensionar"
        >
          <Maximize2 style={{ width: 9, height: 9, color: "white" }} />
        </div>
      )}
    </div>
  );
}
