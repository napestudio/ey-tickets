"use client";

import { useEffect, useRef } from "react";
import { useProducerStockStore } from "@/store/producer-stock-store";

export function ProducerStockInitializer() {
  const initialized = useRef(false);
  const refresh = useProducerStockStore((s) => s.refresh);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refresh();
  }, [refresh]);

  return null;
}
