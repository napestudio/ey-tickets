import { getMercadoPagoTokenByUser, payOrderHandler } from "@/lib/actions";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(req: Request) {
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
  // Obtenemos el id del usuario de la URL
  const userId = searchParams.get("user_id");
  if (userId) {
    // Obtenemos el token del usuario.
    const mpToken = await getMercadoPagoTokenByUser(userId);
    if (mpToken) {
      const mp = new MercadoPagoConfig({
        accessToken: mpToken,
      });
      // Obtenemos el pago
      const payment = await new Payment(mp).get({ id: body.data.id });

      if (payment.status === "approved") {
        await payOrderHandler(payment.external_reference as string);
      }
    }
  }

  return new Response(null, { status: 200 });
}
