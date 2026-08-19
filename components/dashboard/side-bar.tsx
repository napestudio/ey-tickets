"use client";

import {
  Calendar,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Settings,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "../ui/Logo";
import { NavItem } from "@/app/(dashboard)/dashboard/lib/config/dashboard-navigation";
import { ProducerStockWidget } from "./producer-stock-widget";

const ICON_MAP: Record<string, JSX.Element> = {
  dashboard: <LayoutDashboard className="mr-2 h-4 w-4" />,
  calendar: <Calendar className="mr-2 h-4 w-4" />,
  ticket: <Ticket className="mr-2 h-4 w-4" />,
  sales: <CreditCard className="mr-2 h-4 w-4" />,
  users: <Users className="mr-2 h-4 w-4" />,
  chart: <TrendingUp className="mr-2 h-4 w-4" />,
  settings: <Settings className="mr-2 h-4 w-4" />,
};

interface DashboardNavProps {
  session: Session;
  producerName: string | null;
  producerImage: string | null;
  items: NavItem[];
}

export default function SideBar({
  items,
  session,
  producerName,
  producerImage,
}: DashboardNavProps) {
  const path = usePathname();

  const [expandedSections, setExpandedSections] = useState<string[]>(() =>
    items
      .filter(
        (item) =>
          item.children &&
          item.children.some((child) => path.startsWith(child.href)),
      )
      .map((item) => item.title),
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const navItemClass = (active: boolean, base: string) =>
    cn(
      base,
      active
        ? "bg-ey-turquoise text-neutral-900 hover:bg-ey-turquoise font-medium"
        : "font-normal hover:bg-ey-turquoise-dark",
    );

  return (
    <div className="flex flex-col justify-between h-full gap-4 pb-6 pt-2">
      <div className="w-full mb-8 px-4">
        <Link href={SITE_URL} className="pl-8">
          <div className="w-44">
            <Logo />
          </div>
        </Link>
        <nav className="grid items-start gap-2 mt-12">
          {items.map((item) => {
            if (item.children) {
              const isExpanded = expandedSections.includes(item.title);
              const hasActiveChild = !!item.children.some((child) =>
                path.startsWith(child.href),
              );
              return (
                <div key={item.title}>
                  <Button
                    variant={hasActiveChild ? "secondary" : "ghost"}
                    className={navItemClass(
                      hasActiveChild,
                      "w-full justify-start cursor-pointer transition-colors hover:text-neutral-900 active:text-neutral-900",
                    )}
                    onClick={() => toggleSection(item.title)}
                  >
                    {ICON_MAP[item.icon] ?? null}
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 ml-1 shrink-0 transition-transform",
                        isExpanded ? "rotate-0" : "-rotate-90",
                      )}
                    />
                  </Button>
                  {isExpanded && (
                    <div className="mt-1 ml-4 grid gap-1">
                      {item.children.map((child) => {
                        const isActive = path.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={navItemClass(
                              isActive,
                              "flex w-full items-center px-4 py-2 rounded-md text-sm transition-colors hover:text-neutral-900 active:text-neutral-900",
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              item.href === "/dashboard"
                ? path === item.href
                : path.startsWith(item.href!);
            return (
              <Link
                key={item.href ?? item.title}
                href={item.href!}
                className={navItemClass(
                  isActive,
                  "flex w-full items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors hover:text-neutral-900 active:text-neutral-900",
                )}
              >
                {ICON_MAP[item.icon] ?? null}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-5 px-4">
        <div>
          <ProducerStockWidget />
        </div>
        <div className="flex items-center gap-2 px-4">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage
              alt={producerName ?? session.user?.name ?? ""}
              src={producerImage ?? (session.user?.image as string)}
            />
            <AvatarFallback>
              {producerName?.charAt(0) ?? session.user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            {producerName && (
              <Link
                href="/dashboard/configuracion/productora"
                className="text-xs text-neutral-100 truncate hover:underline"
              >
                {producerName}
              </Link>
            )}
            <Link
              href="/dashboard/configuracion/perfil"
              className="text-xs font-medium truncate"
            >
              {session.user?.name}
            </Link>
            <Button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              variant={"link"}
              className="h-auto p-0 text-neutral-50 text-xs justify-start"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
