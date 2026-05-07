import { getDiscountCodeById } from "@/lib/actions";
import { getEventsByUserId } from "@/lib/api/eventos";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

import EditCodeForm from "@/app/dashboard/components/edit-discount-code/edit-discount-code-form";
import { DiscountCode } from "@/types/discount-code";
import { Evento } from "@/types/event";

export default async function EditCode({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const id = session.user.id;
  const discountCode = await getDiscountCodeById(params.id);
  const events = await getEventsByUserId(id);

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Editar código
      </h1>
      <div className="bg-gray-100 p-5 mt-5 rounded w-full text-left">
        <EditCodeForm
          discountCode={discountCode as DiscountCode}
          events={events as Evento[]}
        />
      </div>
    </>
  );
}
