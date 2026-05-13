"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileEditIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { deleteDiscountCode, getEventById } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { DiscountCode } from "@/types/discount-code";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function CodeCard({
  discountCode,
}: {
  discountCode: DiscountCode;
}) {
  const handleDeleteCode = () => {
    deleteDiscountCode(discountCode.id as string)
      .then(() => {
        toast({
          title: "Código borrado!",
        });
      })
      .catch((error: string) => {
        toast({
          variant: "destructive",
          title: "Error eliminado el codigo",
        });
      });
  };

  return (
    <>
      <Card className="w-72 max-w-[95vw]" key={discountCode.id}>
        <CardHeader className="flex flex-row items-center gap-2 text-left">
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{discountCode.code}</CardTitle>
            <CardDescription>
              <span className="font-bold text-xl">
                {discountCode.discount}%
              </span>
            </CardDescription>
            <CardDescription>
              Evento:{" "}
              <span className="font-bold">{discountCode.event.title}</span>
            </CardDescription>
            {/* <CardDescription>
              Expira: {format(discountCode.expiresAt, "dd/MM/yyyy")}
            </CardDescription> */}
          </div>
        </CardHeader>
        <CardFooter className="flex justify-start gap-4">
          <Link href={`/dashboard/codigos/${discountCode.id}`}>
            <FileEditIcon className="w-6 h-6" />
            <span className="sr-only">Editar</span>
          </Link>
          <Button size="icon" variant="destructive" onClick={handleDeleteCode}>
            <TrashIcon className="w-6 h-6" />
            <span className="sr-only"> Eliminar </span>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
