import { getServerSession } from "next-auth";
import Link from "next/link";
import { CalendarDays, BarChart2, Ticket, Settings } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";

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
  const session = await getServerSession(authOptions);
  if (!session) return;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Panel de administración"
        subtitle="Administra tus eventos y venta de tickets"
      />

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
