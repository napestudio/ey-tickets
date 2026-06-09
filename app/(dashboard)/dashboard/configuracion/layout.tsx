import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Separator } from "@/components/ui/separator";
import SettingsNav from "../components/settings-nav/settings-nav";
import { can } from "@/lib/permissions";

const BASE_ITEMS = [
  { title: "Perfil", href: "/dashboard/configuracion/perfil" },
  // { title: "Notificaciones", href: "/dashboard/configuracion/notificaciones" },
];

const ADMIN_ITEMS = [
  { title: "Productora", href: "/dashboard/configuracion/productora" },
  // { title: "Mercado Pago", href: "/dashboard/configuracion/mercado-pago" },
  { title: "Usuarios", href: "/dashboard/configuracion/usuarios" },
  { title: "Métodos de pago", href: "/dashboard/configuracion/metodos-de-pago" },
];

export default async function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const canSeeAdminSettings = session?.user
    ? can(session.user, "settings:producer")
    : false;

  const navItems = canSeeAdminSettings
    ? [...BASE_ITEMS, ...ADMIN_ITEMS]
    : BASE_ITEMS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          Administrá tu perfil y las preferencias de tu cuenta.
        </p>
      </div>
      <Separator />
      <div className="flex gap-8 flex-col lg:gap-12">
        <aside className="shrink-0">
          <SettingsNav items={navItems} />
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
