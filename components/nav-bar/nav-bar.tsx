"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Logo from "../ui/Logo";
import { Button } from "../website/ui/Button";
import { NAV_LINKS } from "@/lib/data/nav-links";

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Timeline del panel
  useEffect(() => {
    const menu = menuRef.current;
    const links = linksRef.current?.children;
    if (!menu || !links) return;

    gsap.set(menu, { yPercent: -100, opacity: 0, visibility: "visible" });
    gsap.set(links, { opacity: 0, y: 20 });

    tlRef.current = gsap
      .timeline({ paused: true })
      .to(menu, { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" })
      .to(
        links,
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" },
        "-=0.15",
      );

    return () => {
      tlRef.current?.kill();
    };
  }, []);

  // Hamburger → X
  useEffect(() => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const l3 = line3Ref.current;
    if (!l1 || !l2 || !l3) return;

    if (isOpen) {
      gsap.to(l1, { rotate: 45, y: 8, duration: 0.3, ease: "power2.inOut" });
      gsap.to(l2, { opacity: 0, scaleX: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(l3, { rotate: -45, y: -8, duration: 0.3, ease: "power2.inOut" });
    } else {
      gsap.to(l1, { rotate: 0, y: 0, duration: 0.3, ease: "power2.inOut" });
      gsap.to(l2, { opacity: 1, scaleX: 1, duration: 0.2, ease: "power2.out" });
      gsap.to(l3, { rotate: 0, y: 0, duration: 0.3, ease: "power2.inOut" });
    }
  }, [isOpen]);

  // Play/reverse del panel
  useEffect(() => {
    if (!tlRef.current) return;
    isOpen ? tlRef.current.play() : tlRef.current.reverse();
  }, [isOpen]);

  // Cerrar al navegar
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/validar") || pathname.startsWith("/dashboard"))
    return null;

  return (
    <>
      <header className="fixed h-20 w-full bg-ey-dark text-white top-0 z-50 font-nebulica">
        <div className="container flex items-center h-full">
          <Button className="mr-6 w-60" href="/">
            <Logo />
          </Button>

          {/* Desktop nav + botón agrupados a la derecha */}
          <nav className="ml-auto hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3">
              {NAV_LINKS.map(({ href, label }) => (
                <Button
                  key={href}
                  className="text-sm font-medium px-2 hover:underline underline-offset-4 hover:text-ey-turquoise hover:bg-transparent transition-colors"
                  href={href}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button
              href="/registro/productora"
              variant="primary"
              className="text-ey-dark bg-ey-turquoise hover:bg-ey-turquoise-dark uppercase rounded-2xl"
            >
              Creá tu evento
            </Button>
          </nav>

          {/* Hamburger */}
          <button
            className="md:hidden ml-auto flex flex-col justify-center gap-1.5 w-10 h-10 cursor-pointer"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            <span
              ref={line1Ref}
              className="block h-0.5 w-6 bg-white rounded-full origin-center"
            />
            <span
              ref={line2Ref}
              className="block h-0.5 w-6 bg-white rounded-full origin-center"
            />
            <span
              ref={line3Ref}
              className="block h-0.5 w-6 bg-white rounded-full origin-center"
            />
          </button>
        </div>
      </header>

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className="fixed top-20 left-0 w-full bg-ey-dark text-white z-40 md:hidden border-t border-white/10 invisible"
      >
        <div ref={linksRef} className="container flex flex-col py-8 gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Button
              key={href}
              className="text-2xl font-medium hover:text-ey-turquoise transition-colors"
              href={href}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Button>
          ))}
          <Button
            href="/registro/productora"
            variant="primary"
            className="text-ey-dark bg-ey-turquoise hover:bg-ey-turquoise-dark uppercase rounded-2xl w-full mt-2"
            onClick={() => setIsOpen(false)}
          >
            Creá tu evento
          </Button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
