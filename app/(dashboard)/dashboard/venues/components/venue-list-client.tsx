"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteVenueAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

type Venue = {
  id: string;
  name: string;
  updatedAt: Date;
  _count: {
    elements: number;
    sectors: number;
    eventVenues: number;
  };
};

export function VenueListClient({ venues }: { venues: Venue[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  function handleRowClick(venueId: string) {
    router.push(`/dashboard/venues/${venueId}/edit`);
  }

  function handleEditClick(e: React.MouseEvent, venueId: string) {
    e.stopPropagation();
    router.push(`/dashboard/venues/${venueId}/edit`);
  }

  function handleDeleteClick(e: React.MouseEvent, venue: Venue) {
    e.stopPropagation();
    setSelectedVenue(venue);
    setAlertOpen(true);
  }

  function handleConfirmDelete() {
    if (!selectedVenue) return;
    setPendingDeleteId(selectedVenue.id);
    startTransition(async () => {
      try {
        await deleteVenueAction(selectedVenue.id);
        toast({ title: "Mapa eliminado correctamente" });
      } catch {
        toast({ title: "No se pudo eliminar el mapa", variant: "destructive" });
      } finally {
        setPendingDeleteId(null);
        setSelectedVenue(null);
      }
    });
  }

  const inUse = selectedVenue && selectedVenue._count.eventVenues > 0;

  return (
    <>
      <Card>
        <div className="rounded-md border max-w-[90vw]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow
                  key={venue.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(venue.id)}
                >
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(venue.updatedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleEditClick(e, venue.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteClick(e, venue)}
                          disabled={isPending && pendingDeleteId === venue.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mapa</AlertDialogTitle>
            <AlertDialogDescription>
              {inUse ? (
                <>
                  El mapa <strong>{selectedVenue?.name}</strong> está siendo
                  usado por uno o más eventos y no puede eliminarse.
                </>
              ) : (
                <>
                  ¿Estás seguro de que querés eliminar el mapa{" "}
                  <strong>{selectedVenue?.name}</strong>? Esta acción no se
                  puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {!inUse && (
              <AlertDialogAction onClick={handleConfirmDelete}>
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
