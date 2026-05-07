"use client";

import {
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import Link from "next/link";
import { menuData } from "../../app/dashboard/data/menuData";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/constants";

interface DashboardNavProps {
  session: Session;
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
}

export default function SideBar({ items, session }: DashboardNavProps) {
  const path = usePathname();

  const getIcon = (icon: string) => {
    switch (icon) {
      case "dashboard":
        return <LayoutDashboard className="mr-2 h-4 w-4" />;
      case "calendar":
        return <Calendar className="mr-2 h-4 w-4" />;
      case "ticket":
        return <Ticket className="mr-2 h-4 w-4" />;
      case "sales":
        return <CreditCard className="mr-2 h-4 w-4" />;
      case "users":
        return <Users className="mr-2 h-4 w-4" />;
      case "settings":
        return <Settings className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-between">
      <nav className="grid items-start gap-2">
        <Link href={SITE_URL}>
          <Button
            variant={"ghost"}
            className={cn("w-full justify-start font-normal")}
          >
            Ir a la web
          </Button>
        </Link>
        {items.map((item, index) => {
          const isActive = path === item.href;
          return (
            <Link key={index} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive ? "bg-muted font-medium" : "font-normal"
                )}
              >
                {getIcon(item.icon)}
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div>
        {/* {filteredMenuData.map((section) =>
          section.items ? (
            <div key={section.title} className="flex flex-col">
              <div className="font-bold">{section.title}</div>
              {section.items.map((item) => (
                <Link key={item.title} href={item.href}>
                  {item.title}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href={section.href ?? "#"}
              legacyBehavior
              passHref
              key={section.title}
            >
              {section.href === "/dashboard" ? (
                <Home className="mb-10" />
              ) : (
                section.title
              )}
            </Link>
          )
        )} */}
      </div>
      <div>
        <div className="flex">
          <Avatar className="h-9 w-9 relative">
            <AvatarImage alt="@shadcn" src={session.user?.image as string} />
            <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            variant={"link"}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
