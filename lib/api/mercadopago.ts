import { MercadoPagoConfig, Preference } from "mercadopago";
import { updateOrder } from "./orders";
import {
  getDigitalPaymentMethodKeyByEvent,
  getMercadoPagoTokenByUser,
} from "../actions";

export const mpApi = {
  order: {
    async createPayment(
      product: any,
      orderData: any,
      orderId: string,
      userId: string,
    ) {
      // const mercadopagoToken = await getMercadoPagoTokenByUser(userId);
      const paymentMethod = await getDigitalPaymentMethodKeyByEvent(
        product.eventId,
      );

      if (paymentMethod && paymentMethod[0].paymentMethod.apiKey) {
        const mercadopagoToken = paymentMethod[0].paymentMethod.apiKey;

        const mercadopago = new MercadoPagoConfig({
          accessToken: mercadopagoToken,
        });

        await updateOrder(orderId, {
          ...orderData,
          paymentMethodId: paymentMethod[0].paymentMethodId,
        });

        // Strip trailing slash to avoid double-slash in constructed URLs
        const siteUrl = (process.env.MP_SITE_URL ?? "").replace(/\/$/, "");

        const preference = await new Preference(mercadopago).create({
          body: {
            items: [
              {
                id: orderId,
                title: `${product.title} x${product.quantity}`,
                unit_price: product.price,
                quantity: product.quantity,
              },
            ],
            metadata: {
              orderId: orderId,
            },
            back_urls: {
              success: `${siteUrl}/eventos}`,
              failure: `${siteUrl}/orders/${orderId}`,
              pending: `${siteUrl}/orders/${orderId}`,
            },
            notification_url: `${siteUrl}/api/mercadopago/pagos?u=${userId}&e=${product.eventId}`,
          },
        });

        return preference.init_point!;
      }
    },
  },
};

export default mpApi;
