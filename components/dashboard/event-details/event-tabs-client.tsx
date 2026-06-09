"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type React from "react";
import { cn } from "@/lib/utils";

interface EventTabsClientProps {
  activeTab: string;
  isEventOwner: boolean;
  children: React.ReactNode;
}

const CONFIG_TABS = ["overview", "tickets", "validators", "paymentMethods"];

export default function EventTabsClient({
  activeTab,
  isEventOwner,
  children,
}: EventTabsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeGroup = CONFIG_TABS.includes(activeTab) ? "config" : "ops";

  function navigateTo(tab: string) {
    const params = new URLSearchParams();
    if (tab !== "overview") params.set("tab", tab);
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  function handleTabChange(value: string) {
    navigateTo(value);
  }

  function handleGroupChange(group: "config" | "ops") {
    if (group === "config") {
      navigateTo("overview");
    } else {
      navigateTo("soldList");
    }
  }

  return (
    <div className="w-full space-y-0">
      {/* Selector de grupo */}
      <div className="flex border-b mb-1">
        <button
          type="button"
          onClick={() => handleGroupChange("config")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeGroup === "config"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Configuración
        </button>
        {isEventOwner && (
          <button
            type="button"
            onClick={() => handleGroupChange("ops")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeGroup === "ops"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Ventas e invitaciones
          </button>
        )}
      </div>

      {/* Sub-tabs del grupo activo */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="overflow-x-auto w-full">
          <TabsList>
            {activeGroup === "config" && (
              <>
                <TabsTrigger value="overview">Detalles</TabsTrigger>
                {isEventOwner && (
                  <>
                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                    <TabsTrigger value="validators">Validadores</TabsTrigger>
                    <TabsTrigger value="paymentMethods">
                      Métodos de pago
                    </TabsTrigger>
                  </>
                )}
              </>
            )}
            {activeGroup === "ops" && isEventOwner && (
              <>
                <TabsTrigger value="soldList">Entradas Vendidas</TabsTrigger>
                <TabsTrigger value="invitados">Invitaciones</TabsTrigger>
                <TabsTrigger value="acciones">Promociones</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>
        {children}
      </Tabs>
    </div>
  );
}
