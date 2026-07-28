import { MercadoPagoConfig, Preference } from "mercadopago";

export async function createStockPurchasePreference(
  packageId: string,
  quantity: number,
  totalPrice: number
) {
  const accessToken = process.env.MP_EYTICKETS_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_EYTICKETS_ACCESS_TOKEN no configurado");

  const siteUrl = process.env.MP_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl || !siteUrl.startsWith("http")) {
    throw new Error("MP_SITE_URL no está configurado correctamente");
  }

  const mp = new MercadoPagoConfig({ accessToken });

  try {
    const preference = await new Preference(mp).create({
      body: {
        items: [
          {
            id: packageId,
            title: `Paquete de ${quantity} tickets - EYTickets`,
            quantity: 1,
            unit_price: totalPrice,
          },
        ],
        external_reference: packageId,
        back_urls: {
          success: `${siteUrl}/dashboard/ticket-stock`,
          failure: `${siteUrl}/dashboard/ticket-stock`,
          pending: `${siteUrl}/dashboard/ticket-stock`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/mercadopago/stock`,
      },
    });

    return preference.init_point!;
  } catch (err) {
    console.error("[EYTickets MP] Error creando Preference:", err);
    throw err;
  }
}
