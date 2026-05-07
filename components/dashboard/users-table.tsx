"use client";
import { format, formatDate } from "date-fns";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  UserPlus,
  Ban,
  ShieldAlert,
  Trash,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { User, UserType } from "@/types/user";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { UserSettingsDialog } from "./user-settings-dialog";
import { UserRoleDialog } from "./user-role-dialog";
import RoleBadge from "./role-badge";
import { deleteUser } from "@/lib/actions";
import { toast } from "../ui/use-toast";
import RemoveUserAlert from "./remove-user-alert";
import { Session } from "next-auth";

export default function UsersTable({
  accounts,
  session,
}: {
  accounts: User[];
  session: Session;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();

  const handleEditSettings = (user: User) => {
    setSelectedUser(user);
    setIsSettingsDialogOpen(true);
  };
  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleRemoveAlert = (user: User) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await deleteUser(selectedUser.id!, selectedUser.email!);

      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Error eliminando el usuario",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Usuario eliminado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: (error as Error).message || "No se pudo eliminar",
      });
    }
  };

  if (accounts.length === 0) return null;
  const isSuperAdmin = session.user.type === "SUPERADMIN";

  const filteredAccounts = isSuperAdmin
    ? accounts
    : accounts.filter((user) => user.type !== "SUPERADMIN");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="flex flex-col md:flex-row gap-4 mb-6"> */}
        {/* <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Producer">Productor</SelectItem>
                <SelectItem value="Seller">
                  Punto de venta / Vendedor
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        {/* </div> */}

        <div className="rounded-md border max-w-[90vw]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Eventos Creados</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={account.image || undefined}
                          alt={account.name || "Avatar"}
                        />
                        <AvatarFallback>
                          {account.name!.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={account.type as UserType | "PRODUCER"} />
                  </TableCell>
                  <TableCell>{account.events?.length || 0}</TableCell>
                  {/* {customer.type !== "SUPERADMIN" && ( */}
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        {account.type !== "SUPERADMIN" && (
                          <DropdownMenuItem
                            onClick={() => {
                              handleEditRole(account);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Editar Rol
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            handleEditSettings(account);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Editar limites
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={account.type === "SUPERADMIN"}
                          onClick={() => {
                            handleRemoveAlert(account);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar cuenta
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
        {selectedUser && isSettingsDialogOpen && (
          <UserSettingsDialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
            user={selectedUser}
          />
        )}
        {selectedUser && isRoleDialogOpen && (
          <UserRoleDialog
            open={isRoleDialogOpen}
            onOpenChange={setIsRoleDialogOpen}
            user={selectedUser}
          />
        )}
        {selectedUser && isDeleteAlertOpen && (
          <RemoveUserAlert
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
            action={handleRemoveUser}
          />
        )}
      </CardContent>
    </Card>
  );
}
