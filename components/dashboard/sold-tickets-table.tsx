"use client";
import { Eye, MoreHorizontal, Copy, Check, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { CancelTicketDialog } from "./cancel-ticket-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useRef, useState } from "react";
import Box from "./box";
import { format } from "date-fns";
import { Input } from "../ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getSoldTicketsPaginatedAction } from "@/lib/actions";
import { es } from "date-fns/locale";
import { slugify } from "@/lib/utils";
import ExportEventAsPDF from "../data-pdf";
import Image from "next/image";
import { generateTicketsPdf } from "@/lib/pdf-utils";

type PageTicket = Awaited<
  ReturnType<typeof getSoldTicketsPaginatedAction>
>["tickets"][number];

interface SoldTicketsTableProps {
  initialTickets: PageTicket[];
  totalCount: number;
  eventId: string;
  eventTitle: string;
  eventAddress: string;
  initialOnlyInvitations?: boolean;
  showInvitationsToggle?: boolean;
  excludeInvitations?: boolean;
  excludeCanceled?: boolean;
  onlyCanceled?: boolean;
  emptyMessage?: string;
}

export default function SoldTicketsTable({
  initialTickets,
  totalCount,
  eventId,
  eventTitle,
  eventAddress,
  initialOnlyInvitations,
  showInvitationsToggle = true,
  excludeInvitations,
  excludeCanceled,
  onlyCanceled,
  emptyMessage = "No hay entradas vendidas.",
}: SoldTicketsTableProps) {
  const [tickets, setTickets] = useState<PageTicket[]>(initialTickets);
  const [total, setTotal] = useState(totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvitations, setShowOnlyInvitations] = useState(
    initialOnlyInvitations ?? false,
  );
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<PageTicket | null>(null);
  const [cancelTicket, setCancelTicket] = useState<PageTicket | null>(null);
  const isFirstRender = useRef(true);

  const totalPages = Math.ceil(total / itemsPerPage);

  async function fetchPage(
    page: number,
    size: number,
    search: string,
    onlyInvitations: boolean,
  ) {
    setLoading(true);
    try {
      const result = await getSoldTicketsPaginatedAction(
        eventId,
        page,
        size,
        search || undefined,
        onlyInvitations || undefined,
        excludeInvitations || undefined,
        excludeCanceled || undefined,
        onlyCanceled || undefined,
      );
      setTickets(result.tickets);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPage(1, itemsPerPage, searchQuery, showOnlyInvitations);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchPage(page, itemsPerPage, searchQuery, showOnlyInvitations);
  };

  const handleSizeChange = async (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    await fetchPage(1, size, searchQuery, showOnlyInvitations);
  };

  const handleInvitationFilter = async () => {
    const next = !showOnlyInvitations;
    setShowOnlyInvitations(next);
    setCurrentPage(1);
    await fetchPage(1, itemsPerPage, searchQuery, next);
  };

  const copyCustomizationLink = async (token: string) => {
    const link = `${window.location.origin}/invitaciones/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleTicketDownload = async (ticket: PageTicket) => {
    if (!ticket.id) return;
    const ticketTypeTitle =
      ticket.ticketType?.title ?? ticket.order?.ticketType?.title ?? "-";
    await generateTicketsPdf({
      ticketDetails: [
        {
          id: ticket.id,
          code: ticket.code,
          buyerName: ticket.name ?? undefined,
          buyerLastName: ticket.lastName ?? undefined,
          email: ticket.email ?? ticket.order?.email ?? undefined,
          dni: ticket.dni ?? undefined,
        },
      ],
      eventTitle,
      ticketTypeTitle,
      generatedAt: ticket.createdAt.toString(),
      filename: `ticket-${slugify(eventTitle)}.pdf`,
    });
  };

  if (total === 0 && !loading) {
    return (
      <Box>
        <p className="font-bold text-gray-500">{emptyMessage}</p>
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-2 mb-4">
        <div className="flex gap-2">
          <ExportEventAsPDF
            eventTitle={eventTitle}
            eventId={eventId}
            quantity={total}
            type="ESTADISTICAS"
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-62.5"
          />
          {showInvitationsToggle && (
            <Button
              variant={showOnlyInvitations ? "default" : "outline"}
              onClick={handleInvitationFilter}
            >
              {showOnlyInvitations ? "Ver todos" : "Ver invitados"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprador</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-start flex-col gap-1">
                      <div className="font-bold">
                        {ticket.name ||
                          ticket.order?.email?.split("@")[0] ||
                          "—"}{" "}
                        {ticket.lastName ?? ""}
                      </div>
                      <div className="text-xs">
                        {ticket.email || ticket.order?.email || "—"}
                      </div>
                      {ticket.status === "CANCELED" && (
                        <Badge variant="destructive" className="text-xs">
                          Cancelada
                        </Badge>
                      )}
                      {ticket.isInvitation &&
                        ticket.order?.customizationToken && (
                          <Badge
                            variant={
                              ticket.order.customizedAt
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {ticket.order.customizedAt
                              ? "Personalizada"
                              : "Pendiente"}
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{ticket.dni}</TableCell>
                  <TableCell className="font-medium">
                    {ticket.order?.ticketType?.title}
                  </TableCell>
                  <TableCell className="font-medium">
                    {format(ticket.createdAt, "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ticket.isInvitation &&
                          ticket.order?.customizationToken &&
                          !ticket.order.customizedAt && (
                            <DropdownMenuItem asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="inline-flex gap-1 items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md cursor-pointer"
                                onClick={() =>
                                  copyCustomizationLink(
                                    ticket.order!.customizationToken!,
                                  )
                                }
                              >
                                {copiedToken ===
                                ticket.order.customizationToken ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                {copiedToken === ticket.order.customizationToken
                                  ? "Copiado"
                                  : "Copiar link"}
                              </Button>
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full inline-flex gap-1 items-center justify-start whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md cursor-pointer"
                            onClick={() => setDetailTicket(ticket)}
                          >
                            <Eye className="h-4 w-4" />
                            Mostrar detalle
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full inline-flex gap-1 items-center justify-start whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-9 rounded-md cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setCancelTicket(ticket)}
                            disabled={ticket.status === "CANCELED"}
                          >
                            <X className="h-4 w-4" />
                            {ticket.status === "CANCELED" ? "Cancelada" : "Cancelar entrada"}
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full inline-flex gap-1 items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md cursor-pointer"
                            onClick={() => handleTicketDownload(ticket)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-file-image w-4 h-4"
                            >
                              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                              <circle cx="10" cy="12" r="2" />
                              <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
                            </svg>{" "}
                            Descargar
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (pageNumber === 2 && currentPage > 3) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              if (
                pageNumber === totalPages - 1 &&
                currentPage < totalPages - 2
              ) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => handleSizeChange(Number(value))}
          >
            <SelectTrigger className="w-17.5">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog
        open={detailTicket !== null}
        onOpenChange={(open) => {
          if (!open) setDetailTicket(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de entrada</DialogTitle>
            <DialogDescription>
              Información y QR de la entrada seleccionada.
            </DialogDescription>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N.°</span>
                  <span className="font-medium">
                    {String(detailTicket.code).padStart(5, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador</span>
                  <span className="font-medium">
                    {detailTicket.name || detailTicket.order?.email?.split("@")[0] || "—"}{" "}
                    {detailTicket.lastName ?? ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">
                    {detailTicket.email || detailTicket.order?.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI</span>
                  <span className="font-medium">{detailTicket.dni || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">
                    {detailTicket.ticketType?.title ??
                      detailTicket.order?.ticketType?.title ??
                      "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de venta</span>
                  <span className="font-medium">
                    {format(detailTicket.createdAt, "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evento</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {eventTitle}
                  </span>
                </div>
                {eventAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {eventAddress}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  QR de entrada
                </p>
                <div className="bg-white p-3 rounded-lg border">
                  <Image
                    src={`/api/tickets/qr/${detailTicket.id}`}
                    alt="QR de entrada"
                    width={200}
                    height={200}
                    className="block"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CancelTicketDialog
        ticket={cancelTicket}
        onClose={() => setCancelTicket(null)}
        onSuccess={() =>
          fetchPage(currentPage, itemsPerPage, searchQuery, showOnlyInvitations)
        }
      />
    </div>
  );
}
