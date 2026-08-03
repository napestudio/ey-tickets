import {
  getDigitalPaymentMethodKeyByEvent,
  getMercadoPagoTokenByUser,
  payOrderHandler,
} from "@/lib/actions";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(req: Request) {
  try {
    const res = await req.json();

    const topic = res.topic || res.type;
    // Algunas veces el topic es payment pero la respuesta no trae el objeto data.
    // Si esto es asi, no lo dejamos pasar
    if (topic !== "payment" || !res.data) {
      return new Response(null, { status: 200 });
    }

    // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
    const body: { data: { id: string } } = res;
    const { searchParams } = new URL(req.url);
    // Obtenemos el id del evento de la URL
    const eventId = searchParams.get("e");

    if (!eventId) {
      console.error("MP webhook: missing eventId in query params");
      return new Response(null, { status: 200 });
    }

    // Obtenemos el token del método de pago
    const paymentMethod = await getDigitalPaymentMethodKeyByEvent(eventId);
    const mpToken = paymentMethod[0]?.paymentMethod.apiKey;

    if (!mpToken) {
      console.error("MP webhook: no payment method token for event", eventId);
      return new Response(null, { status: 200 });
    }

    const mp = new MercadoPagoConfig({ accessToken: mpToken });
    // Obtenemos el pago
    const payment = await new Payment(mp).get({ id: body.data.id });

    if (payment.status === "approved") {
      // MP may return metadata keys in snake_case (order_id) or camelCase (orderId)
      const orderId = payment.metadata?.order_id ?? payment.metadata?.orderId;
      if (!orderId) {
        console.error("MP webhook: missing orderId in payment metadata", payment.id);
        return new Response(null, { status: 200 });
      }
      try {
        await payOrderHandler(orderId, {
          mpPaymentId: String(payment.id),
          mpDateApproved: payment.date_approved
            ? new Date(payment.date_approved)
            : null,
          mpPaymentMethodId: payment.payment_method_id ?? null,
          mpPaymentTypeId: payment.payment_type_id ?? null,
          mpInstallments: payment.installments ?? null,
          mpAuthorizationCode: payment.authorization_code ?? null,
        });
      } catch (err) {
        console.error("MP webhook: error in payOrderHandler:", err);
      }
    }
  } catch (err) {
    console.error("MP webhook: unhandled error:", err);
  }

  return new Response(null, { status: 200 });
}
