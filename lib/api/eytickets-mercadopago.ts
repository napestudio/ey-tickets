import { MercadoPagoConfig, Preference } from "mercadopago";

export async function createStockPurchasePreference(
  packageId: string,
  quantity: number,
  totalPrice: number
) {
  const accessToken = process.env.MP_EYTICKETS_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_EYTICKETS_ACCESS_TOKEN no configurado");

  const mp = new MercadoPagoConfig({ accessToken });

  const preference = await new Preference(mp).create({
    body: {
      items: [
        {
          id: packageId,
          title: `Paquete de ${quantity} tickets - EYTickets`,
          quantity: 1,
          unit_price: totalPrice,
          currency_id: "ARS",
        },
      ],
      external_reference: packageId,
      back_urls: {
        // MP agrega automáticamente ?payment_id=xxx&status=approved a la success URL
        success: `${process.env.MP_SITE_URL}/dashboard/ticket-stock`,
        failure: `${process.env.MP_SITE_URL}/dashboard/ticket-stock`,
        pending: `${process.env.MP_SITE_URL}/dashboard/ticket-stock`,
      },
      auto_return: "approved",
      notification_url: `${process.env.MP_SITE_URL}/api/mercadopago/stock`,
    },
  });

  return preference.init_point!;
}
