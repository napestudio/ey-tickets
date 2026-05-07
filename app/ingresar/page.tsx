import { getServerSession } from "next-auth";
import SignInButton from "../dashboard/components/sign-in-button/sign-in-button";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import LoginForm from "./login-form";
import Link from "next/link";
import Image from "next/image";

export default async function Ingresar() {
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    redirect("/dashboard");
  }
  return (
    <div className="flex w-full h-screen items-center justify-center relative bg-black">
      <div className="hidden md:block md:w-1/2 bg-black h-full relative">
        <Image src="/ingresar.jpg" fill alt="" className="object-cover" />
      </div>
      <div className="w-full sm:w-2/3 md:w-1/2 md:h-full bg-white">
        <div className="rounded-md py-6 px-3 md:px-32 flex flex-col items-center justify-center gap-5 h-full">
          <h1 className="text-black text-4xl font-bold text-center">
            INGRESAR
          </h1>
          <LoginForm />
          <hr className="mx-auto w-4/5 border-black" />
          <div className="flex items-center flex-col justify-center gap-2 w-3/4 mx-auto">
            <h4 className="font-bold">O ingresar con</h4>
            <SignInButton />
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/ingresar/reset"
              className="font-medium underline"
              prefetch={false}
            >
              <h4 className="font-bold text-black hover:text-gray-500">¿Olvidaste la contraseña?</h4>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
