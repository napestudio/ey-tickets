import React, { useId, useMemo } from "react";

interface ShapeMaskProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderColor?: string;
  borderWidth?: number;
  orientation?: "horizontal" | "vertical"; // Nueva Prop
}

export function ShapeMask({
  children,
  className,
  style,
  borderColor,
  borderWidth = 2,
  orientation = "horizontal",
}: ShapeMaskProps) {
  const clipId = useId();
  const maskId = useId();

  // Genera el path adaptativo según la orientación
  const normalizedPath = useMemo(() => {
    const GAP_1 = 1 / 3;          
    const GAP_2 = GAP_1; 
    const R = 0.08; 
    
    const INNER_LOW = 0.1;
    const INNER_HIGH = 0.9;

    // Helper para alternar X e Y dinámicamente según la orientación
    const coord = (x: number | string, y: number | string) => 
      orientation === "horizontal" ? `${x},${y}` : `${y},${x}`;

    return `
      M${coord(0, R)}
      ${orientation === "horizontal" ? "V" : "H"}${1 - R}
      Q${coord(0, 1)} ${coord(R, 1)}
      ${orientation === "horizontal" ? "H" : "V"}${GAP_1 - R}
      Q${coord(GAP_1, 1)} ${coord(GAP_1, 1 - R)}
      ${orientation === "horizontal" ? "V" : "H"}${INNER_HIGH}
      ${orientation === "horizontal" ? "H" : "V"}${GAP_2}
      ${orientation === "horizontal" ? "V" : "H"}${1 - R}
      Q${coord(GAP_2, 1)} ${coord(GAP_2 + R, 1)}
      ${orientation === "horizontal" ? "H" : "V"}${1 - R}
      Q${coord(1, 1)} ${coord(1, 1 - R)}
      ${orientation === "horizontal" ? "V" : "H"}${R}
      Q${coord(1, 0)} ${coord(1 - R, 0)}
      ${orientation === "horizontal" ? "H" : "V"}${GAP_2 + R}
      Q${coord(GAP_2, 0)} ${coord(GAP_2, R)}
      ${orientation === "horizontal" ? "V" : "H"}${INNER_LOW}
      ${orientation === "horizontal" ? "H" : "V"}${GAP_1}
      ${orientation === "horizontal" ? "V" : "H"}${R}
      Q${coord(GAP_1, 0)} ${coord(GAP_1 - R, 0)}
      ${orientation === "horizontal" ? "H" : "V"}${R}
      Q${coord(0, 0)} ${coord(0, R)}
      Z
    `.trim();
  }, [orientation]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: "100%",
        ...style,
      }}
    >
      {/* Definiciones globales de máscaras */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {/* 1. Recorte para el contenido */}
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={normalizedPath} />
          </clipPath>

          {/* 2. Máscara para el Inset Stroke */}
          <mask id={maskId} maskContentUnits="objectBoundingBox">
            <path d={normalizedPath} fill="white" />
          </mask>
        </defs>
      </svg>

      {/* Contenedor del contenido recortado */}
      <div
        style={{
          width: "100%",
          height: "100%",
          clipPath: `url(#${clipId})`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Borde SVG con efecto Inset */}
      {borderColor && (
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <path
            d={normalizedPath}
            fill="none"
            stroke={borderColor}
            strokeWidth={borderWidth * 2} 
            vectorEffect="non-scaling-stroke"
            mask={`url(#${maskId})`}
          />
        </svg>
      )}
    </div>
  );
}