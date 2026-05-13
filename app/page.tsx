import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Gestión de eventos y entradas online",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
  return (
    <>
      <div className="h-screen bg-neutral-900"></div>
    </>
  );
}
