import NewTokenDialog from "@/app/dashboard/components/new-token-dialog/new-token-dialog";
import TokensCard from "@/app/dashboard/components/tokens-card/tokens-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTokensByEvent } from "@/lib/actions";
import { ValidatorToken } from "@/types/validators";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";

export default async function Validators({
  params,
}: {
  params: { id: string };
}) {
  const tokens = await getTokensByEvent(params.id);
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
        Tokens de validadores
      </h1>
      <div className="flex gap-5 items-center justify-center py-4">
        <Link href={`/validar/${params.id}`} target="_blank">
          Ir a validar
        </Link>
        <NewTokenDialog eventId={params.id} />
      </div>
      <div className="flex flex-col justify-center items-center gap-5">
        {tokens && tokens.length === 0 && (
          <Card className="p-6">No hay tokens de validación creados.</Card>
        )}
        {tokens && tokens.length > 0 && (
          <>
            {tokens.map((token: ValidatorToken) => (
              <TokensCard token={token} key={token.id} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
