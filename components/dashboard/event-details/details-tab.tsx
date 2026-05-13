import PaymentMethodsLoader from "@/app/(dashboard)/dashboard/metodos-de-pago/methods-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento } from "@/types/event";
import DeleteEventButton from "../delete-event-button";
import PaymentMethodsList from "../payment-methods-list";
import { Separator } from "@/components/ui/separator";
import { Session } from "next-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DetailsTabProps {
  evento: Evento;
  isSeller: boolean;
  isEventOwner: boolean;
  session: Session;
}

export default function DetailsTab({
  evento,
  isSeller,
  isEventOwner,
  session,
}: DetailsTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Descripción del evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{evento.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dirección</CardTitle>
          <CardDescription>
            {evento.location} | {evento.address}
          </CardDescription>
        </CardHeader>
      </Card>
      {!isSeller && isEventOwner && (
        <div className="flex flex-col max-w-[90vw] gap-5">
          {evento.eventPayments &&
            evento.eventPayments?.length > 0 &&
            evento.producerId && (
              <>
                <PaymentMethodsList methods={evento.eventPayments} />
                <Separator />
                <Card className="px-5">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Métodos de pago disponibles
                      </AccordionTrigger>
                      <AccordionContent>
                        <>
                          {evento.eventPayments && (
                            <PaymentMethodsLoader
                              producerId={evento.producerId}
                              eventId={evento.id}
                              session={session}
                            />
                          )}
                        </>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </>
            )}

          {evento.eventPayments &&
            evento.producerId &&
            evento.eventPayments?.length === 0 && (
              <>
                {evento.eventPayments && (
                  <PaymentMethodsLoader
                    producerId={evento.producerId}
                    eventId={evento.id}
                    session={session}
                  />
                )}
              </>
            )}
        </div>
      )}
      {!isSeller && isEventOwner && (
        <div className="pt-28">
          <Separator />
          <Card className="bg-black text-white">
            <CardHeader>
              <CardTitle>Eliminar evento permanentemente</CardTitle>
              <CardDescription className="text-white">
                Esta acción no se puede revertir. Por favor, asegúrate de que
                deseas eliminar este evento antes de continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteEventButton id={evento.id} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
