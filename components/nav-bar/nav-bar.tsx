"use client";

import { TicketIcon } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

import { User } from "@/types/user";
import AdminDropDown from "../admin-dropdown/admin-dropdown";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import Logo from "../ui/Logo";

export default function NavBar({}: // user,
// session,
{
  // user?: User;
  // session: Session;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <header className="h-20 w-full px-4 md:px-6 bg-neutral-900 text-white top-0 z-50">
      <div className="container flex items-center h-full">
        <Link className="mr-6 w-[120px]" href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 hover:text-green-500"
            href="/faqs"
          >
            FAQS
          </Link>
        </nav>

        {/* {session && <AdminDropDown user={user as User} session={session} />} */}
      </div>
    </header>
  );
}
