import MercadoPagoForm from "../../mercado-pago-form/mercado-pago-form";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllUserConfiguration } from "@/lib/actions";
import { UserConfiguration } from "@/types/user-configuration";

export default async function MercadoPago() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const id = session.user.id;
  const userConfiguration = (await getAllUserConfiguration(id)) || [];

  return (
    <>
      <>
        <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Mercado Pago
        </h2>
        <div className="bg-gray-100 p-5 rounded w-full">
          <MercadoPagoForm
            configuration={userConfiguration as UserConfiguration[]}
            userId={id}
          />
        </div>
      </>
      {/* )} */}
    </>
  );
}
