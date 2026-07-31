"use client";
import { useState, useCallback, useEffect } from "react";
import { getSoldTicketsPaginatedValidatorAction } from "@/lib/actions";
import { TicketOrderTableProps } from "@/types/tickets";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { getColumns } from "./colums";

const PAGE_SIZE = 10;

type SearchResults = {
  tickets: Partial<TicketOrderTableProps>[];
  total: number;
};

export default function SearchPanel({
  eventId,
  sessionId,
  onStatsUpdate,
  onlyInvitations,
  excludeInvitations,
  onlyValidatedBySession,
  autoLoad,
}: {
  eventId: string;
  sessionId: string;
  onStatsUpdate: () => void;
  onlyInvitations?: boolean;
  excludeInvitations?: boolean;
  onlyValidatedBySession?: boolean;
  autoLoad?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = useCallback(
    async (q: string, p: number) => {
      if (!autoLoad && !q.trim()) {
        setResults(null);
        return;
      }
      setIsLoading(true);
      const data = await getSoldTicketsPaginatedValidatorAction(
        eventId,
        sessionId,
        p,
        PAGE_SIZE,
        q.trim() || undefined,
        onlyInvitations,
        excludeInvitations,
        onlyValidatedBySession,
      );
      setResults(data as SearchResults);
      setIsLoading(false);
    },
    [eventId, sessionId, autoLoad, onlyInvitations, excludeInvitations, onlyValidatedBySession],
  );

  // Auto-load on mount when autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      void runSearch("", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search on query change (skip on mount when autoLoad handled it)
  useEffect(() => {
    if (autoLoad && query === "") return;
    const timer = setTimeout(() => {
      void runSearch(query, 1);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, runSearch, autoLoad]);

  const handleUpdateData = useCallback(() => {
    onStatsUpdate();
    void runSearch(query, page);
  }, [onStatsUpdate, runSearch, query, page]);

  const columns = getColumns("VALIDADOR", sessionId, onlyValidatedBySession);

  const canGoPrev = page > 1;
  const canGoNext = results !== null && results.tickets.length === PAGE_SIZE;

  return (
    <div className="flex flex-col h-full gap-3 text-neutral-50">
      <Input
        placeholder="Buscar por nombre, apellido, DNI o email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={!autoLoad}
        className="shrink-0"
      />

      {isLoading && (
        <p className="text-sm text-neutral-400 shrink-0">Buscando...</p>
      )}

      {!isLoading && !autoLoad && query.trim() && results && results.tickets.length === 0 && (
        <p className="text-sm text-neutral-400 shrink-0">Sin resultados.</p>
      )}

      {!isLoading && autoLoad && results && results.tickets.length === 0 && (
        <p className="text-sm text-neutral-400 shrink-0">Sin resultados.</p>
      )}

      {results && results.tickets.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <DataTable
            columns={columns}
            data={results.tickets}
            updateData={handleUpdateData}
            className="flex-1 min-h-0"
          />
          <div className="flex justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                void runSearch(query, p);
              }}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                void runSearch(query, p);
              }}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
