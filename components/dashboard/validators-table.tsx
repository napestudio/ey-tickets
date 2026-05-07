"use client";
import {
  Check,
  Copy,
  Globe,
  Key,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Trash,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ValidatorToken } from "@/types/validators";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import Box from "./box";
import { deleteTokenById } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ValidatorsTable({
  tokens,
}: {
  tokens: ValidatorToken[];
}) {
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const copyToClipboard = (tokenId: string, tokenValue: string) => {
    navigator.clipboard.writeText(tokenValue);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleDeleteToken = (tokenId: string) => {
    deleteTokenById(tokenId)
      .then(() => {
        toast({
          title: "Token de validación eliminado",
        });
      })
      .catch((error: string) => {
        toast({
          variant: "destructive",
          title: "Error eliminando el token de validación",
        });
      });
  };
  return (
    <div className="space-y-6">
      {tokens.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Info</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                        {token.token}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(token.id, token.token)}
                      >
                        {copiedTokenId === token.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{token.notes}</TableCell>

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
                        <DropdownMenuItem>
                          <Link
                            href={`/validar/${token.eventId}`}
                            target="_blank"
                            className="flex"
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Ir a Validar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(token.id, token.token)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar token
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteToken(token.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar token
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Box>
          <p className="font-bold text-gray-500">No hay tokens creados.</p>
        </Box>
      )}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium">
                Sobre los Tokens de validación
              </h3>
              <p className="text-sm text-muted-foreground">
                Los tokens de validación son códigos de 8 dígitos que el staff
                del evento puede usar para iniciar sesión en la aplicación de
                validación. Cada evento puede tener multiples tokens.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Por razones de seguridad, recomendamos crear los tokens antes de
                cada evento y eliminarlos una vez que el evento haya finalizado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
