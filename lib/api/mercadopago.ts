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
      userId: string
    ) {
      // const mercadopagoToken = await getMercadoPagoTokenByUser(userId);
      const paymentMethod = await getDigitalPaymentMethodKeyByEvent(
        product.eventId
      );

      if (paymentMethod && paymentMethod[0].paymentMethod.apiKey) {
        const mercadopagoToken = paymentMethod[0].paymentMethod.apiKey;

        const mercadopago = new MercadoPagoConfig({
          accessToken: mercadopagoToken,
        });

        updateOrder(orderId, orderData);
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
              success: process.env.MP_SITE_URL,
            },
            notification_url: `${process.env.MP_SITE_URL}/api/mercadopago/pagos?u=${userId}&e=${product.eventId}`,
          },
        });

        return preference.init_point!;
      }
    },
  },
};

export default mpApi;
