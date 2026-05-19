import { getServerSession } from "next-auth";
import SignInButton from "@/app/(dashboard)/dashboard/components/sign-in-button/sign-in-button";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import LoginForm from "./login-form";
import Link from "next/link";
import Image from "next/image";
import SectionTitle from "@/components/website/ui/SectionTitle";

export default async function Ingresar() {
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    redirect("/dashboard");
  }
  return (
    <div className="flex bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80% text-white py-24 items-center justify-center relative">
      <div className="w-full sm:w-2/3 md:w-1/2 md:h-full">
        <div className="rounded-md py-6 px-3 md:px-32 flex flex-col items-center justify-center gap-5 h-full">
          <SectionTitle as="h1">INGRESAR</SectionTitle>
          <LoginForm />
          <hr className="mx-auto w-4/5 border-black" />
          {/* <div className="flex items-center flex-col justify-center gap-2 w-3/4 mx-auto">
            <h4 className="font-bold">O ingresar con</h4>
            <SignInButton />
          </div> */}
          <div className="text-center text-sm text-neutral-100 dark:text-neutral-50">
            <Link
              href="/ingresar/reset"
              className="font-medium underline"
              prefetch={false}
            >
              Olvidé mi contraseña
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
