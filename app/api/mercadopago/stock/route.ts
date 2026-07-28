import { confirmTicketPackagePurchase } from "@/lib/api/ticket-stock";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(req: Request) {
  const body = await req.json();
  const topic = body.topic || body.type;

  // Ignorar notificaciones que no sean de tipo payment o que no traigan data
  if (topic !== "payment" || !body.data) {
    return new Response(null, { status: 200 });
  }

  const accessToken = process.env.MP_EYTICKETS_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[MP Stock Webhook] MP_EYTICKETS_ACCESS_TOKEN no configurado");
    return new Response(null, { status: 500 });
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken });
    const payment = await new Payment(mp).get({ id: body.data.id });

    if (payment.status === "approved") {
      const packageId = payment.external_reference;
      if (!packageId) {
        console.error("[MP Stock Webhook] external_reference vacío en el pago", payment.id);
        return new Response(null, { status: 200 });
      }

      const feeAmount =
        payment.fee_details?.reduce(
          (acc: number, f: { amount?: number }) => acc + (f.amount ?? 0),
          0
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
