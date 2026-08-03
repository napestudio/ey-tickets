import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import ResetForm from "./reset-form";
import { Title } from "@/components/website/ui/Title";
import Link from "next/link";
import Logo from "@/components/ui/LogoFooter";

export default async function Register({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-b to-black from-ey-turquoise-darker to-80%">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-2 py-6 max-w-[200px]">
          <Logo />
        </Link>
      </div>
      <div className="container mx-auto py-14 flex flex-col gap-4 md:max-w-2xl">
        <div className="flex flex-col mb-6">
          <Title className="text-white font-bold uppercase text-[clamp(2.5rem,8vw,3.5rem)] leading-none text-center">
            Recuperar<br/><span className="text-ey-turquoise">contraseña</span> 
          </Title>
        </div>
        <ResetForm />
      </div>
    </div>
  );
}
