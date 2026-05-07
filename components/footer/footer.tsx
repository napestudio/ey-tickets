"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <footer>
      <div className="w-full  bg-black py-4">
        <div className="container">
          <div className="text-white text-center">
            <p className="text-sm">
              Desarrollado por <span className="font-bold">NAP</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
