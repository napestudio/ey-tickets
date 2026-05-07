"use client";
import { SITE_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Contact } from "lucide-react";

export default function PreFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return;
  return (
    <div className="bg-neutral-950 text-white py-32">
      <div className="container flex gap-12 md:flex-row flex-col md:items-start w-full md:justify-between items-center justify-center">
        <div className="flex flex-col items-start gap-6">
          <Image
            src={"/img/cohete.png"}
            width={581}
            height={477}
            alt={`${SITE_NAME} isologo`}
            className="w-[150px] max-w-[95vw]"
          />
          <Image
            src={"/img/logo.png"}
            width={581}
            height={477}
            alt={`${SITE_NAME} logo`}
            className="w-[150px] max-w-[95vw]"
          />
        </div>
        <div className="h-full flex flex-col justify-between items-center md:items-end gap-5">
          <Image
            src={"/img/logo-mug.png"}
            width={699}
            height={705}
            alt="Logo mug.ar"
            className="w-[150px]"
          />
          <div className="text-center md:text-right">
            <p>
              <strong>yendo.ar</strong> es un producto de{" "}
              <Link
                href={"https://www.mug.ar/"}
                target="_blank"
                className="font-bold"
              >
                MUG.ar
              </Link>
            </p>
            <p>
              Por consultas o reclamos escribir a{" "}
              <span className="font-bold">entradas.yendo@gmail.com</span>
            </p>
            <div>
              <Link
                href={"/ingresar"}
                className="flex items-center justify-self-center border-2 w-max mx-auto md:mx-0 p-2 font-semibold rounded-xl gap-2 md:justify-self-end mt-3 hover:bg-white hover:text-black transition-colors duration-200"
              >
                <Contact /> Acceso a backstage
              </Link>
            </div>
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
