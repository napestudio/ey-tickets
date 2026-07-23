"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Menu,
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
import { NavItem } from "@/app/(dashboard)/dashboard/lib/config/dashboard-navigation";

interface MobileSidebarProps {
  items: NavItem[];
}

export function MobileSidebar({ items }: MobileSidebarProps) {
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

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

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
              if (item.children) {
                const isExpanded = expandedSections.includes(item.title);
                const hasActiveChild = item.children.some((child) =>
                  pathname.startsWith(child.href),
                );
                return (
                  <div key={index}>
                    <Button
                      variant={hasActiveChild ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        hasActiveChild ? "bg-muted font-medium" : "font-normal",
                      )}
                      onClick={() => toggleSection(item.title)}
                    >
                      {getIcon(item.icon)}
                      <span className="flex-1 text-left">{item.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 ml-1 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                      )}
                    </Button>
                    {isExpanded && (
                      <div className="mt-1 ml-4 flex flex-col gap-1">
                        {item.children.map((child, childIndex) => {
                          const isActive = pathname.startsWith(child.href);
                          return (
                            <Link
                              key={childIndex}
                              href={child.href}
                              onClick={() => setOpen(false)}
                            >
                              <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full justify-start text-sm",
                                  isActive
                                    ? "bg-muted font-medium"
                                    : "font-normal",
                                )}
                              >
                                {child.title}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={index}
                  href={item.href!}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive ? "bg-muted font-medium" : "font-normal",
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
