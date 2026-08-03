import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

import { getProducerById } from "@/lib/api/producers";
import ProductoraForm from "../../components/productora-form/productora-form";
import ProducerConfigForm from "../../components/producer-config-form/producer-config-form";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function ProductoraConfigPage() {
  const session = await getSession();

  if (!session?.user?.producerId) {
    redirect("/dashboard");
  }

  const producer = await getProducerById(session.user.producerId);

  if (!producer) {
    redirect("/dashboard");
  }

  const canEdit =
    session.user.role === "OWNER" || session.user.role === "ADMIN";
  const canEditConfig = session.user.isSuperAdmin === true;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Productora"
          subtitle="Configurá los datos de tu productora."
        />
      </div>
      {canEdit ? (
        <>
          <ProductoraForm producer={producer} />
          {canEditConfig && (
            <ProducerConfigForm
              producerId={producer.id}
              configuration={producer.configuration}
            />
          )}
        </>
      ) : canEditConfig ? (
        <ProducerConfigForm
          producerId={producer.id}
          configuration={producer.configuration}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No tenés permisos para editar esta sección.
        </p>
      )}
    </div>
  );
}
