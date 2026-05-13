import { getDiscountCodeById } from "@/lib/actions";
import { getAccessibleEvents } from "@/lib/api/eventos";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

import EditCodeForm from "@/app/(dashboard)/dashboard/components/edit-discount-code/edit-discount-code-form";
import { DiscountCode } from "@/types/discount-code";
import { Evento } from "@/types/event";

export default async function EditCode({ params }: { params: Promise<{ id: string }> }) {
  const { id: codeId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return;
  const { id, isSuperAdmin, producerId, role } = session.user;
  const discountCode = await getDiscountCodeById(codeId);
  const events = await getAccessibleEvents({ id, isSuperAdmin, producerId, role });

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Editar código
      </h1>
      <div className="bg-gray-100 p-5 mt-5 rounded w-full text-left">
        <EditCodeForm
          discountCode={discountCode as DiscountCode}
          events={events as unknown as Evento[]}
        />
      </div>
    </>
  );
}
