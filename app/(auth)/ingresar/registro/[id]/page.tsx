import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import RegisterForm from "./register-form";
import { getInvitationsById } from "@/lib/actions";
import { isExpired } from "@/lib/utils";
import Image from "next/image";

function ExpiredMsg() {
  return (
    <section className="h-screen w-full py-6 md:py-12 flex items-center justify-center">
      <div>
        <h2 className="text-2xl mb-10 font-bold tracking-tighter sm:text-2xl md:text-3xl text-center">
          Invitación vencida
        </h2>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="font-medium underline ml-1"
            prefetch={false}
          >
            Volver al sitio
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function Register({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    redirect("/dashboard");
  }

  const invitation = await getInvitationsById(id);

  if (!invitation) redirect("/");
  if (invitation) {
    if (isExpired(invitation.expiresAt)) {
      return <ExpiredMsg />;
    }

    return (
      <div className="flex w-full h-screen items-center justify-center relative bg-black">
        <div className="hidden md:block md:w-1/2 bg-black h-full relative">
          <Image src="/ingresar.jpg" fill alt="" className="object-cover" />
        </div>
        <div className="w-full sm:w-2/3 md:w-1/2 h-full bg-white">
          <div className="rounded-md py-6 px-3 md:px-32 flex flex-col items-center justify-center gap-5 h-full">
            <div className="flex flex-col text-center mb-6">
              <h1 className="text-black text-4xl font-bold text-center mb-4">
                COMPLETAR REGISTRO
              </h1>
              <p className="leading-7">
                Crea una contraseña para tu cuenta{" "}
                <span className="font-bold">{invitation.email}</span>
              </p>
            </div>
            <RegisterForm email={invitation.email} />

            <div className="text-center text-sm dark:text-gray-400 text-black">
              No tenés cuenta?
              <Link
                href="#"
                className="font-bold underline ml-1"
                prefetch={false}
              >
                Registrate
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
