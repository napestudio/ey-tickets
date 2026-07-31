import { Metadata } from "next";
import ValidatorsPageHandler from "./handler";
import Logo from "@/components/ui/Logo";
import ValidatorsNavbar from "./validators-navbar";

export const metadata: Metadata = {
  title: "Panel de validación",
  description: "Plataforma de venta de entradas online",
};

export default async function ValidatorPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <div className="dark w-full flex flex-col bg-neutral-900">
      <ValidatorsNavbar eventId={eventId} />
      <div className="w-137.5 max-w-[95vw] mx-auto h-full">
        <ValidatorsPageHandler eventId={eventId} />;
      </div>
    </div>
  );
}
