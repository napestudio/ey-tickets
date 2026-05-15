import { getServerSession } from "next-auth";

import CreateCodeForm from "../components/create-discount-code/create-discount-code";
import { getAccessibleEvents } from "@/lib/api/eventos";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Evento } from "@/types/event";

export default async function NewCode() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const { id, producerId, role } = session.user;
  const events = await getAccessibleEvents({ id, producerId, role });

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Nuevo código
      </h1>
      <div className="bg-gray-100 p-5 mt-5 rounded w-full text-left">
        <CreateCodeForm events={events as unknown as Evento[]} />
      </div>
    </>
  );
}
