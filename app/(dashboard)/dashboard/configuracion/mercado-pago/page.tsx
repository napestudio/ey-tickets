import MercadoPagoForm from "../../mercado-pago-form/mercado-pago-form";

export default async function MercadoPago() {
  return (
    <>
      <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Mercado Pago
      </h2>
      <div className="bg-gray-100 p-5 rounded w-full">
        <MercadoPagoForm />
      </div>
    </>
  );
}
