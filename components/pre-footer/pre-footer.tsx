"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../ui/Logo";

export default function PreFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <div className="pt-24 bg-linear-to-t from-ey-dark to-ey-turquoise-darker text-white">
      <div className="container flex flex-col gap-12  w-full md:justify-between items-center justify-center">
        <Logo />
      </div>
    </div>
  );
}
