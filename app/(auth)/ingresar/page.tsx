import { getServerSession } from "next-auth";
import SignInButton from "@/app/(dashboard)/dashboard/components/sign-in-button/sign-in-button";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import LoginForm from "./login-form";
import Link from "next/link";
import Image from "next/image";
import { Title } from "@/components/website/ui/Title";
import Logo from "@/components/ui/Logo";

export default async function Ingresar() {
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-linear-to-b to-black from-ey-turquoise-darker to-80%">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-2 py-6 max-w-50">
          <Logo />
        </Link>
      </div>
      <div className="container mx-auto py-14 flex flex-col gap-4 max-w-lg">
        <Title className="text-white font-nebulica font-bold uppercase text-[clamp(2.5rem,8vw,3.5rem)] leading-none text-center">
          Ingresar
        </Title>
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
        <div className="text-center text-sm text-neutral-100 dark:text-neutral-50">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro/productora"
            className="font-medium underline"
            prefetch={false}
          >
            Registrate
          </Link>
        </div>
      </div>
    </div>
  );
}
