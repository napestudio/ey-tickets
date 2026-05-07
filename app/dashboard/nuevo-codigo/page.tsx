import { getServerSession } from "next-auth";

import CreateCodeForm from "../components/create-discount-code/create-discount-code";
import { getAllEvents, getEventsByUserId } from "@/lib/api/eventos";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function NewCode() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const id = session.user.id;
  const events =
    session?.user.type === "SELLER"
      ? await getEventsByUserId(id)
      : await getAllEvents();
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Nuevo código
      </h1>
      <div className="bg-gray-100 p-5 mt-5 rounded w-full text-left">
        <CreateCodeForm events={events} />
      </div>
    </>
  );
}
