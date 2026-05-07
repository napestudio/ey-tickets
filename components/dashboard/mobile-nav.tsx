"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Calendar,
  CreditCard,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileSidebarProps {
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
}

export function MobileSidebar({ items }: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  if (!items?.length) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className=" bg-black text-white">
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-5 bottom-5 md:hidden z-50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            <span>EventTix</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-2 pr-6">
            {items.map((item, index) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
