"use client";

import { create } from "zustand";
import {
  EditorElement,
  EditorSector,
  VenueElementType,
  VenueElement,
  VenueSector,
  ELEMENT_DEFAULTS,
  ELEMENT_COLORS,
  SECTOR_PALETTE,
} from "@/types/venue";

function randomLocalId(): string {
  return `local-${Math.random().toString(36).slice(2, 9)}`;
}

type VenueEditorStore = {
  sectors: EditorSector[];
  elements: EditorElement[];
  selectedId: string | null;
  gridWidth: number;
  gridHeight: number;
  isDirty: boolean;

  // Initialisation
  loadFromSaved: (
    sectors: VenueSector[],
    elements: VenueElement[],
    gridWidth: number,
    gridHeight: number,
  ) => void;
  markSaved: () => void;

  // Sector management
  addSector: () => void;
  removeSector: (localId: string) => void;
  updateSectorName: (localId: string, name: string) => void;
  updateSectorColor: (localId: string, color: string) => void;

  // Element management
  addElement: (type: VenueElementType) => void;
  addElementFull: (config: {
    type: VenueElementType;
    label?: string;
    color?: string;
    sectorId?: string | null;
    rowLabel?: string;
    startNumber?: number;
    seatCount?: number;
    seatPattern?: "ALL" | "ODD" | "EVEN";
    orderDirection?: "ASC" | "DESC";
    seatSpacing?: number;
    tableCapacity?: number;
  }) => void;
  removeElement: (localId: string) => void;
  selectElement: (localId: string | null) => void;

  // Position & size
  moveElement: (localId: string, x: number, y: number) => void;
  resizeElement: (localId: string, width: number, height: number) => void;

  // Rotation
  rotateElement: (localId: string, rotation: number) => void;

  // Properties
  updateElementLabel: (localId: string, label: string) => void;
  updateElementColor: (localId: string, color: string) => void;
  updateElementSector: (localId: string, sectorId: string | null) => void;

  // ROW-specific config
  updateRowConfig: (
    localId: string,
    config: Partial<{
      rowLabel: string;
      startNumber: number;
      seatCount: number;
      seatPattern: "ALL" | "ODD" | "EVEN";
      orderDirection: "ASC" | "DESC";
      seatSpacing: number;
    }>,
  ) => void;

  // TABLE-specific config
  updateTableCapacity: (localId: string, capacity: number) => void;
};

export const useVenueEditorStore = create<VenueEditorStore>((set, get) => ({
  sectors: [],
  elements: [],
  selectedId: null,
  gridWidth: 40,
  gridHeight: 30,
  isDirty: false,

  loadFromSaved: (sectors, elements, gridWidth, gridHeight) => {
    set({
      sectors: sectors.map((s) => ({
        ...s,
        localId: s.id ?? randomLocalId(),
      })),
      elements: elements.map((el) => ({
        ...el,
        localId: el.id ?? randomLocalId(),
        isDirty: false,
      })),
      gridWidth,
      gridHeight,
      selectedId: null,
      isDirty: false,
    });
  },

  markSaved: () => {
    set((state) => ({
      isDirty: false,
      elements: state.elements.map((el) => ({ ...el, isDirty: false })),
    }));
  },

  // ─── Sectors ────────────────────────────────────────────────────────────────

  addSector: () => {
    const { sectors } = get();
    const colorIdx = sectors.length % SECTOR_PALETTE.length;
    const newSector: EditorSector = {
      localId: randomLocalId(),
      name: `Sector ${sectors.length + 1}`,
      color: SECTOR_PALETTE[colorIdx],
      position: sectors.length,
    };
    set((state) => ({
      sectors: [...state.sectors, newSector],
      isDirty: true,
    }));
  },

  removeSector: (localId) => {
    set((state) => ({
      sectors: state.sectors.filter((s) => s.localId !== localId),
      // Unassign elements that belonged to this sector
      elements: state.elements.map((el) =>
        el.sectorId === localId ? { ...el, sectorId: null, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  updateSectorName: (localId, name) => {
    set((state) => ({
      sectors: state.sectors.map((s) =>
        s.localId === localId ? { ...s, name } : s,
      ),
      isDirty: true,
    }));
  },

  updateSectorColor: (localId, color) => {
    set((state) => ({
      sectors: state.sectors.map((s) =>
        s.localId === localId ? { ...s, color } : s,
      ),
      isDirty: true,
    }));
  },

  // ─── Elements ───────────────────────────────────────────────────────────────

  addElement: (type) => {
    const defaults = ELEMENT_DEFAULTS[type];
    const color = ELEMENT_COLORS[type];

    const newElement: EditorElement = {
      localId: randomLocalId(),
      type,
      label: defaults.label,
      x: 0,
      y: 0,
      width: defaults.width,
      height: defaults.height,
      color: type === "ROW" ? null : color,
      rotation: 0,
      sectorId: null,
      // ROW defaults
      rowLabel: type === "ROW" ? "A" : null,
      startNumber: type === "ROW" ? 1 : null,
      seatCount: type === "ROW" ? 10 : null,
      seatPattern: type === "ROW" ? "ALL" : null,
      orderDirection: type === "ROW" ? "ASC" : null,
      seatSpacing: type === "ROW" ? 40 : null,
      // TABLE defaults
      tableCapacity: type === "TABLE" ? 4 : null,
      isDirty: true,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedId: newElement.localId,
      isDirty: true,
    }));
  },

  addElementFull: (config) => {
    const defaults = ELEMENT_DEFAULTS[config.type];
    const color = ELEMENT_COLORS[config.type];

    const newElement: EditorElement = {
      localId: randomLocalId(),
      type: config.type,
      label: config.label ?? defaults.label,
      x: 0,
      y: 0,
      width: defaults.width,
      height: defaults.height,
      color: config.type === "ROW" ? null : (config.color ?? color),
      rotation: 0,
      sectorId: config.sectorId ?? null,
      rowLabel: config.type === "ROW" ? (config.rowLabel ?? "A") : null,
      startNumber: config.type === "ROW" ? (config.startNumber ?? 1) : null,
      seatCount: config.type === "ROW" ? (config.seatCount ?? 10) : null,
      seatPattern: config.type === "ROW" ? (config.seatPattern ?? "ALL") : null,
      orderDirection:
        config.type === "ROW" ? (config.orderDirection ?? "ASC") : null,
      seatSpacing: config.type === "ROW" ? (config.seatSpacing ?? 40) : null,
      // TABLE defaults
      tableCapacity: config.type === "TABLE" ? (config.tableCapacity ?? 4) : null,
      isDirty: true,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedId: newElement.localId,
      isDirty: true,
    }));
  },

  removeElement: (localId) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.localId !== localId),
      selectedId: state.selectedId === localId ? null : state.selectedId,
      isDirty: true,
    }));
  },

  selectElement: (localId) => {
    set({ selectedId: localId });
  },

  moveElement: (localId, x, y) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId ? { ...el, x, y, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  resizeElement: (localId, width, height) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId
          ? {
              ...el,
              width: Math.max(1, width),
              height: Math.max(1, height),
              isDirty: true,
            }
          : el,
      ),
      isDirty: true,
    }));
  },

  rotateElement: (localId, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId
          ? { ...el, rotation: ((rotation % 360) + 360) % 360, isDirty: true }
          : el,
      ),
      isDirty: true,
    }));
  },

  updateElementLabel: (localId, label) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId ? { ...el, label, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  updateElementColor: (localId, color) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId ? { ...el, color, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  updateElementSector: (localId, sectorId) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId ? { ...el, sectorId, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  updateRowConfig: (localId, config) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId ? { ...el, ...config, isDirty: true } : el,
      ),
      isDirty: true,
    }));
  },

  updateTableCapacity: (localId, capacity) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.localId === localId
          ? { ...el, tableCapacity: Math.max(1, capacity), isDirty: true }
          : el,
      ),
      isDirty: true,
    }));
  },
}));
