"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { deleteTokenById, updateValidatorToken } from "@/lib/actions";
import { ValidatorToken } from "@/types/validators";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Copy, Pencil, Trash2 } from "lucide-react";
import AlertRemove from "../alert-remove/alert-remove";

function EditTokenDialog({
  token,
  eventId,
  onUpdate,
}: {
  token: ValidatorToken;
  eventId: string;
  onUpdate: (
    id: string,
    data: { notes: string | null; isActive: boolean },
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(token.notes ?? "");
  const [isActive, setIsActive] = useState(token.isActive);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(v: boolean) {
    if (v) {
      setNotes(token.notes ?? "");
      setIsActive(token.isActive);
    }
    setOpen(v);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateValidatorToken(
        token.id,
        { notes: notes.trim() || null, isActive },
        eventId,
      );
      onUpdate(token.id, { notes: notes.trim() || null, isActive });
      toast({ title: "Token actualizado" });
      setOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error actualizando el token" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar token">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar token — {token.token}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor={`notes-${token.id}`}>Etiqueta</Label>
            <Input
              id={`notes-${token.id}`}
              placeholder="Ej: Puerta 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Estado</Label>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "Activo — puede usarse para validar"
                  : "Suspendido — no puede usarse"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ValidatorsTable({
  tokens: initialTokens,
  eventId,
}: {
  tokens: ValidatorToken[];
  eventId: string;
}) {
  const [tokens, setTokens] = useState<ValidatorToken[]>(initialTokens);

  function handleCopy(token: string) {
    navigator.clipboard
      .writeText(token)
      .then(() => toast({ title: "Token copiado al portapapeles" }))
      .catch(() =>
        toast({ variant: "destructive", title: "Error copiando el token" }),
      );
  }

  function handleUpdate(
    id: string,
    data: { notes: string | null; isActive: boolean },
  ) {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }

  async function handleDelete(tokenId: string) {
    try {
      await deleteTokenById(tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      toast({ title: "Token de validación eliminado" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error eliminando el token de validación",
      });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Etiqueta</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Vencimiento</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground py-10"
            >
              No hay tokens de validación creados.
            </TableCell>
          </TableRow>
        ) : (
          tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell>
                <button
                  onClick={() => handleCopy(token.token)}
                  className="font-mono font-semibold text-sm hover:underline cursor-pointer"
                  title="Copiar token"
                >
                  {token.token}
                </button>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-50 truncate">
                {token.notes ?? <span className="italic">Sin etiqueta</span>}
              </TableCell>
              <TableCell>
                <Badge variant={token.isActive ? "default" : "secondary"}>
                  {token.isActive ? "Activo" : "Suspendido"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {token.endDate ? (
                  format(new Date(token.endDate), "dd MMM yyyy", { locale: es })
                ) : (
                  <span className="text-muted-foreground">Sin límite</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(token.createdAt), "dd MMM yyyy", {
                  locale: es,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(token.token)}
                    title="Copiar token"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <EditTokenDialog
                    token={token}
                    eventId={eventId}
                    onUpdate={handleUpdate}
                  />
                  <AlertRemove
                    text="Esta acción no se puede revertir. El token de validación se eliminará permanentemente."
                    action={() => handleDelete(token.id)}
                  >
                    <Button variant="ghost" size="icon" title="Eliminar token">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertRemove>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
