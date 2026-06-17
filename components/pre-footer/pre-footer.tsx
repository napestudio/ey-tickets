"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoFooter from "../ui/LogoFooter";
import { Button } from "../website/ui/Button";

const NAV_LINKS = [
  { href: "/eventos", label: "Eventos" },
  { href: "/faqs", label: "Faqs" },
];

export default function PreFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <div className="pt-24 text-white bg-linear-to-b to-black from-ey-turquoise-darker to-80%">
      <div className="container flex flex-col gap-12 w-full md:justify-between items-center justify-center">
        <nav className="mx-auto flex items-center gap-6 ">
            {NAV_LINKS.map(({ href, label }) => (
              <Button
                key={href}
                className="bg-transparent uppercase text-sm font-medium hover:underline underline-offset-4 hover:text-ey-turquoise hover:bg-transparent transition-colors"
                href={href}
              >
                {label}
              </Button>
            ))}
            <Button
              href="/contactos"
              variant="primary"
              className="bg-transparent uppercase text-sm font-medium hover:underline underline-offset-4 hover:text-ey-turquoise hover:bg-transparent transition-colors"
            >
              Contactos
            </Button>
          </nav>
        <LogoFooter />
      </div>
    </div>
  );
}
