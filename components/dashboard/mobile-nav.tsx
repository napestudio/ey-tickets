"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Calendar,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { NavItem } from "@/app/(dashboard)/dashboard/lib/config/dashboard-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "../ui/Logo";

interface MobileSidebarProps {
  items: NavItem[];
  session: Session;
  producerName: string | null;
  producerImage: string | null;
}

export function MobileSidebar({ items, session, producerName, producerImage }: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [expandedSections, setExpandedSections] = useState<string[]>(() =>
    items
      .filter(
        (item) =>
          item.children &&
          item.children.some((child) => pathname.startsWith(child.href)),
      )
      .map((item) => item.title),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case "dashboard":
        return <LayoutDashboard className="mr-3 h-5 w-5 shrink-0" />;
      case "calendar":
        return <Calendar className="mr-3 h-5 w-5 shrink-0" />;
      case "ticket":
        return <Ticket className="mr-3 h-5 w-5 shrink-0" />;
      case "sales":
        return <CreditCard className="mr-3 h-5 w-5 shrink-0" />;
      case "users":
        return <Users className="mr-3 h-5 w-5 shrink-0" />;
      case "settings":
        return <Settings className="mr-3 h-5 w-5 shrink-0" />;
      case "chart":
        return <BarChart2 className="mr-3 h-5 w-5 shrink-0" />;
      default:
        return null;
    }
  };

  if (!items?.length) {
    return null;
  }

  return (
    <>
      {/* Fixed top navbar — only visible on mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 h-14 flex items-center justify-between px-4 shadow-lg">
        <div className="w-32">
          <Logo />
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <span
            className={cn(
              "absolute transition-all duration-200",
              open ? "opacity-100 rotate-0" : "opacity-0 rotate-90",
            )}
          >
            <X className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "absolute transition-all duration-200",
              open ? "opacity-0 -rotate-90" : "opacity-100 rotate-0",
            )}
          >
            <Menu className="h-5 w-5" />
          </span>
        </button>
      </nav>

      {/* Spacer to offset fixed navbar height in the document flow */}
      <div className="md:hidden h-14 shrink-0" />

      {/* Full-screen animated overlay menu */}
      <div
        aria-hidden={!open}
        className={cn(
          "md:hidden fixed inset-0 top-14 z-40 bg-neutral-900 overflow-y-auto transition-all duration-300 ease-in-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-1 p-4 pb-0">
          {items.map((item, index) => {
            if (item.children) {
              const isExpanded = expandedSections.includes(item.title);
              const hasActiveChild = item.children.some((child) =>
                pathname.startsWith(child.href),
              );

              return (
                <div key={index}>
                  <button
                    className={cn(
                      "w-full flex items-center px-4 py-3 rounded-lg text-left text-base transition-colors",
                      hasActiveChild
                        ? "bg-neutral-700 text-white font-medium"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white",
                    )}
                    onClick={() => toggleSection(item.title)}
                  >
                    {getIcon(item.icon)}
                    <span className="flex-1">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 ml-2 shrink-0 transition-transform duration-200",
                        isExpanded ? "rotate-0" : "-rotate-90",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="ml-4 mt-1 flex flex-col gap-1 pb-1">
                      {item.children.map((child, childIndex) => {
                        const isActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={childIndex}
                            href={child.href}
                            className={cn(
                              "flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-neutral-700 text-white font-medium"
                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-base transition-colors",
                  isActive
                    ? "bg-neutral-700 text-white font-medium"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white",
                )}
              >
                {getIcon(item.icon)}
                {item.title}
              </Link>
            );
          })}
        </div>

        {/* Profile & logout section */}
        <div className="p-4 mt-2 border-t border-neutral-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={producerImage ?? ""} alt={producerName ?? ""} />
              <AvatarFallback className="bg-neutral-700 text-white">
                {producerName?.charAt(0) ?? session.user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              {producerName && (
                <span className="text-xs text-neutral-400 truncate">{producerName}</span>
              )}
              <span className="text-sm font-medium text-white truncate">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-xs mt-0.5 w-fit"
              >
                <LogOut className="h-3 w-3" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
