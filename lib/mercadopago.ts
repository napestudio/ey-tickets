"use server";
import { redirect } from "next/navigation";
import mpApi from "./api/mercadopago";

export async function createMercadoPagoOrder(
  product: any,
  orderData: any,
  orderId: string,
  userId: string
) {
  let url: string | undefined = undefined;
  try {
    url = await mpApi.order.createPayment(
      product,
      orderData,
      orderId!,
      product.eventId
    );
  } catch (error) {
    throw new Error("Error generando Orden de mercado pago");
  }
  if (url) {
    redirect(url);
  }
}
