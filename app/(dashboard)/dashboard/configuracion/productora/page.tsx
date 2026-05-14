import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getProducerById } from "@/lib/api/producers";
import ProductoraForm from "../../components/productora-form/productora-form";

export default async function ProductoraConfigPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.producerId) {
    redirect("/dashboard");
  }

  const producer = await getProducerById(session.user.producerId);

  if (!producer) {
    redirect("/dashboard");
  }

  const canEdit =
    session.user.role === "OWNER" || session.user.role === "ADMIN";

  return (
    <div>
      {canEdit ? (
        <ProductoraForm producer={producer} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No tenés permisos para editar esta sección.
        </p>
      )}
    </div>
  );
}
