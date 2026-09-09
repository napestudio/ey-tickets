"use client";

import { EditorElement, EditorSector } from "@/types/venue";
import { VenueElementRow } from "./venue-element-row";
import { VenueElementTable } from "./venue-element-table";
import { VenueElementBlock } from "./venue-element-block";

export interface VenueElementNodeProps {
  element: EditorElement;
  sectors: EditorSector[];
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export function VenueElementNode(props: VenueElementNodeProps) {
  switch (props.element.type) {
    case "ROW":
      return <VenueElementRow {...props} />;
    case "TABLE":
      return <VenueElementTable {...props} />;
    default:
      return <VenueElementBlock {...props} />;
  }
}
