"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoFooter from "../ui/LogoFooter";
import { Button } from "../website/ui/Button";
import { NAV_LINKS } from "@/lib/data/nav-links";

export default function PreFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <div className="pt-24 text-white bg-linear-to-b to-black from-ey-turquoise-darker to-80% overflow-hidden font-nebulica">
      <div className="container flex flex-col gap-12 w-full md:justify-between items-center justify-center">
        <nav className="mx-auto flex items-center gap-0 md:gap-6 py-10">
          {NAV_LINKS.map(({ href, label }) => (
            <Button
              key={href}
              className="text-xs bg-transparent uppercase md:text-sm font-medium hover:underline underline-offset-4 hover:text-ey-turquoise hover:bg-transparent transition-colors"
              href={href}
            >
              {label}
            </Button>
          ))}
          <Button
            href="/registro/productora"
            variant="primary"
            className="text-xs bg-transparent uppercase md:text-sm font-medium hover:underline underline-offset-4 hover:text-ey-turquoise hover:bg-transparent transition-colors"
          >
            Creá tu evento
          </Button>
        </nav>
      </div>
      <LogoFooter />
    </div>
  );
}
