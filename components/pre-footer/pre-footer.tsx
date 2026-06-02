"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PreFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <div className="bg-neutral-950 text-white py-32">
      <div className="container flex gap-12 md:flex-row flex-col md:items-start w-full md:justify-between items-center justify-center">
        <div className="h-full flex flex-col justify-between items-center md:items-end gap-5">
          <div className="text-center md:text-right">
            <p>
              Por consultas escribir a{" "}
              <span className="font-bold">hola@eytickets.ar</span>
            </p>
            <ul className="mt-4">
              <li>
                <Link
                  className="text-xs hover:underline"
                  href={"/terminos-y-condiciones"}
                >
                  Términos y condiciones de uso
                </Link>
              </li>
              <li></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
