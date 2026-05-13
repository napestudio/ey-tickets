import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ResetForm from "./reset-form";

export default async function Register({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex w-full h-screen items-center justify-center relative">
      <div className="hidden md:block md:w-1/2 bg-black h-full"></div>
      <div className="md:w-1/2">
        <div className="bg-white rounded-md py-6 px-3 md:px-32 flex flex-col gap-5">
          <div className="flex flex-col text-center mb-6">
            <h1 className="text-black text-4xl font-bold text-center">
              RECUPERAR CONTRASEÑA
            </h1>
          </div>
          <ResetForm />
        </div>
      </div>
    </div>
  );
}
