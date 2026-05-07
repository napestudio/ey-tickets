import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import SignInButton from "@/app/dashboard/components/sign-in-button/sign-in-button";
import NewPasswordForm from "./new-password-form";
import { getInvitationsById } from "@/lib/actions";
import { isExpired } from "@/lib/utils";


export default async function NewPassword({ params }: { params: { token: string } }) {
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
          <NewPasswordForm token={params.token}/>
        </div>
      </div>
    </div>
  );
}
