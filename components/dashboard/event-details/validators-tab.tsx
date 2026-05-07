import NewTokenDialog from "@/app/dashboard/components/new-token-dialog/new-token-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento } from "@/types/event";
import ValidatorsTable from "../validators-table";
import { ValidatorToken } from "@/types/validators";

export default function ValidatorsTab({ evento }: { evento: Evento }) {
  return (
    <Card className="max-w-[90vw]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tokens de validación</CardTitle>
          <CardDescription>
            Administra los tokens de validación de este evento
          </CardDescription>
        </div>
        <NewTokenDialog eventId={evento.id} />
      </CardHeader>
      <CardContent>
        {evento.validatorToken && (
          <ValidatorsTable tokens={evento.validatorToken as ValidatorToken[]} />
        )}
      </CardContent>
    </Card>
  );
}
