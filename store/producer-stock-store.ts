import { create } from "zustand";
import { getProducerStockSummaryAction } from "@/lib/actions";
import type { StockSummary } from "@/types/ticket-stock";

interface ProducerStockState {
  summary: StockSummary | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useProducerStockStore = create<ProducerStockState>((set) => ({
  summary: null,
  isLoading: false,
  refresh: async () => {
    set({ isLoading: true });
    try {
      const data = await getProducerStockSummaryAction();
      set({ summary: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
