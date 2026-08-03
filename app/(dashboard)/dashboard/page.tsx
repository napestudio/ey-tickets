import Link from "next/link";
import { CalendarDays, BarChart2, Ticket, Settings, Plus } from "lucide-react";

import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import NewEventButton from "./components/new-event-button/new-event-button";

const navItems = [
  {
    href: "/dashboard/eventos",
    icon: CalendarDays,
    label: "Eventos",
    description: "Gestioná tus eventos",
  },
  {
    href: "/dashboard/reportes",
    icon: BarChart2,
    label: "Reportes",
    description: "Consultá estadísticas y ventas",
  },
  {
    href: "/dashboard/ticket-stock",
    icon: Ticket,
    label: "Stock",
    description: "Administración del stock de tickets",
  },
  {
    href: "/dashboard/configuracion",
    icon: Settings,
    label: "Configuración",
    description: "Ajustes de tu cuenta",
  },
];

export default async function Dashboard() {
  const session = await getSession();
  if (!session) return;

  const role = session.user.role;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Panel de administración"
        subtitle="Administra tus eventos y venta de tickets"
      />

      {role !== "SELLER" && <NewEventButton />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {navItems.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-3 rounded-xl border bg-card p-3 text-center shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-6 w-6" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
