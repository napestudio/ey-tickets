"use client";

import {
  Calendar,
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
import Logo from "../ui/Logo";

interface DashboardNavProps {
  session: Session;
  producerName: string | null;
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
}

export default function SideBar({
  items,
  session,
  producerName,
}: DashboardNavProps) {
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
      case "chart":
        return <TrendingUp className="mr-2 h-4 w-4" />;
      case "settings":
        return <Settings className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between h-full gap-4 py-6">
      <Link href={SITE_URL} className="w-full pl-8 mb-8">
        <div className="w-44">
          <Logo />
        </div>
      </Link>
      <nav className="grid items-start gap-2 px-4">
        {items.map((item, index) => {
          const isActive =
            item.href === "/dashboard"
              ? path === item.href
              : path.startsWith(item.href);
          return (
            <Link key={index} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start cursor-pointer hover:bg-ey-turquoise-dark transition-colors",
                  isActive
                    ? "bg-ey-turquoise hover:bg-ey-turquoise font-medium"
                    : "font-normal",
                )}
              >
                {getIcon(item.icon)}
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 px-4">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage alt="@shadcn" src={session.user?.image as string} />
          <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          {producerName && (
            <span className="text-xs text-neutral-100 truncate">
              {producerName}
            </span>
          )}
          <span className="text-sm font-medium truncate">
            {session.user?.name}
          </span>
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
  );
}
