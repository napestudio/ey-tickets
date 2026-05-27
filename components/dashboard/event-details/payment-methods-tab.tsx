import PaymentMethodsLoader from "@/app/(dashboard)/dashboard/metodos-de-pago/methods-loader";
import { Evento } from "@/types/event";
import PaymentMethodsList from "../payment-methods-list";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Session } from "next-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PaymentMethodsTabProps {
  evento: Evento;
  session: Session;
}

export default function PaymentMethodsTab({
  evento,
  session,
}: PaymentMethodsTabProps) {
  if (!evento.producerId) return null;

  return (
    <div className="flex flex-col max-w-[90vw] gap-5">
      {evento.eventPayments && evento.eventPayments.length > 0 && (
        <>
          <PaymentMethodsList methods={evento.eventPayments} />
          <Separator />
          <Card className="px-5">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Métodos de pago disponibles</AccordionTrigger>
                <AccordionContent>
                  <PaymentMethodsLoader
                    producerId={evento.producerId}
                    eventId={evento.id}
                    session={session}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </>
      )}

      {evento.eventPayments && evento.eventPayments.length === 0 && (
        <PaymentMethodsLoader
          producerId={evento.producerId}
          eventId={evento.id}
          session={session}
        />
      )}
    </div>
  );
}
