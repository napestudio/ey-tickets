"use client";

import useSWR, { mutate } from "swr";
import { getProducerStockSummaryAction } from "@/lib/actions";

export const PRODUCER_STOCK_SUMMARY_KEY = "producer-stock-summary";

export function useProducerStockSummary() {
  const { data, isLoading } = useSWR(
    PRODUCER_STOCK_SUMMARY_KEY,
    getProducerStockSummaryAction,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return { summary: data ?? null, isLoading: isLoading && data === undefined };
}

export function refreshProducerStockSummary() {
  return mutate(PRODUCER_STOCK_SUMMARY_KEY);
}
