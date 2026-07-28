import { confirmTicketPackagePurchase } from "@/lib/api/ticket-stock";
import MercadoPagoConfig, { Payment } from "mercadopago";

// GET: permite que MP y cualquier herramienta de diagnóstico verifiquen
// que la URL es accesible antes de enviar notificaciones.
export async function GET() {
  return new Response("OK", { status: 200 });
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  // Volcar headers relevantes para diagnóstico
  const headersForLog: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersForLog[key] = value;
  });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("[MP Stock Webhook] Body no es JSON válido");
    return new Response(null, { status: 200 });
  }

  const topic = (body.topic || body.type) as string | undefined;

  // Ignorar notificaciones que no sean de tipo payment o que no traigan data
  if (topic !== "payment" || !body.data) {
    return new Response(null, { status: 200 });
  }

  const accessToken = process.env.MP_EYTICKETS_ACCESS_TOKEN;
  if (!accessToken) {
    return new Response(null, { status: 500 });
  }

  try {
    const data = body.data as { id?: string | number };
    const paymentId = data.id;

    const mp = new MercadoPagoConfig({ accessToken });
    const payment = await new Payment(mp).get({ id: Number(paymentId) });

    if (payment.status === "approved") {
      const packageId = payment.external_reference;
      if (!packageId) {
        console.error(
          "[MP Stock Webhook] external_reference vacío en el pago",
          payment.id,
        );
        return new Response(null, { status: 200 });
      }

      const feeAmount =
        payment.fee_details?.reduce(
          (acc: number, f: { amount?: number }) => acc + (f.amount ?? 0),
          0,
        ) ?? null;

      await confirmTicketPackagePurchase(packageId, {
        mpPaymentId: String(payment.id),
        mpDateApproved: payment.date_approved
          ? new Date(payment.date_approved)
          : null,
        mpPaymentMethodId: payment.payment_method_id ?? null,
        mpPaymentTypeId: payment.payment_type_id ?? null,
        mpInstallments: payment.installments ?? null,
        mpAuthorizationCode: payment.authorization_code ?? null,
        mpTransactionAmount: payment.transaction_amount ?? null,
        mpNetReceivedAmount:
          payment.transaction_details?.net_received_amount ?? null,
        mpFeeAmount: feeAmount,
        mpCurrencyId: payment.currency_id ?? null,
        mpRawResponse: payment as object,
      });
    }
  } catch (err) {
    console.error("[MP Stock Webhook] Error procesando notificación:", err);
    // Devolvemos 200 igual para que MP no reintente indefinidamente
  }

  return new Response(null, { status: 200 });
}
