"use client";
import { UserInvitation } from "@/types/user-invitations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserType } from "@/types/user";
import { Badge } from "../ui/badge";
import { format, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Copy, MoreHorizontal, Trash, UserPlus } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { formatDatesByMonth } from "@/lib/utils";
import { addDays, isAfter, isBefore, isSameDay } from "date-fns";
import RoleBadge from "./role-badge";
import CancelInvitationAlert from "./cancel-invitation-alert";
import { removeInvitationById } from "@/lib/actions";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { SITE_URL } from "@/lib/constants";

export default function UserInvitationsTable({
  invitations,
}: {
  invitations: UserInvitation[];
}) {
  const [selectedInvitation, setSelectedInvitation] =
    useState<UserInvitation>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const getStatus = (accepted: boolean, date: string | Date) => {
    const dayAfter = addDays(date, 1);

    if (accepted === false && isBefore(new Date(), date)) {
      return "PENDIENTE";
    }
    if (accepted === false && isAfter(dayAfter, date)) {
      return "VENCIDA";
    }
  };
  const handleCopyInvitationLink = (invite: UserInvitation) => {
    const url = `${SITE_URL}/api/invitations/accept?id=${invite.id}&t=${invite.token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link de invitación copiado correctoamente",
    });
  };
  const handleCancelAlert = (invite: UserInvitation) => {
    setSelectedInvitation(invite);
    setIsAlertOpen(true);
  };

  const handleCancelInvitation = (id: string) => {
    removeInvitationById(id)
      .then(() => {
        toast({
          title: "Invitación Eliminada",
          variant: "destructive",
        });
      })
      .catch((error: string) => {
        toast({
          variant: "destructive",
          title: "Error eliminando la invitación",
        });
      });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de invitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de invitación</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge
                        role={invitation.role as UserType | "PRODUCER"}
                      />
                    </TableCell>
                    {invitation.createdAt && (
                      <TableCell>
                        {format(invitation.createdAt, "dd MMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                    )}
                    <TableCell>
                      {format(invitation.expiresAt, "dd MMM yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatus(
                        invitation.accepted || false,
                        invitation.expiresAt
                      )}
                    </TableCell>
                    {/* {customer.type !== "SUPERADMIN" && ( */}
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

                          <DropdownMenuItem
                            onClick={() => handleCopyInvitationLink(invitation)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar link de invitación
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleCancelAlert(invitation)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Cancelar invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    {/* )} */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {isAlertOpen && selectedInvitation && (
        <CancelInvitationAlert
          action={handleCancelInvitation}
          id={selectedInvitation.id!}
          actionText="Cancelar Invitación"
          title="Cancelar Invitación?"
          onOpenChange={setIsAlertOpen}
          open={isAlertOpen}
          text="Esto eliminará la invitación definitivamente. Ésta acción no elimina al usuario si el mismo ya pertenece a la plataforma."
        />
      )}
    </>
  );
}
