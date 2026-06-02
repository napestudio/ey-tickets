"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import Logo from "../ui/Logo";
import { Button } from "../website/ui/Button";

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
    <header className="fixed h-20 w-full px-4 md:px-6 bg-ey-dark text-white top-0 z-50">
      <div className="container flex items-center h-full space-x-24">
        <Link className="mr-6 w-30" href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 hover:text-green-500"
            href="/faqs"
          >
            EVENTOS
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 hover:text-green-500"
            href="/faqs"
          >
            FAQS
          </Link>
        </nav>
        <Button href="/ingresar" variant="primary">
          Ingresar
        </Button>

        {/* {session && <AdminDropDown user={user as User} session={session} />} */}
      </div>
    </header>
  );
}
