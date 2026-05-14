import MercadoPagoForm from "../../mercado-pago-form/mercado-pago-form";

export default async function MercadoPago() {
  return (
    <>
      <h2 className="text-lg font-medium">Mercado Pago</h2>
      <div className="bg-gray-100 p-5 rounded w-full">
        <MercadoPagoForm />
      </div>
    </>
  );
}
