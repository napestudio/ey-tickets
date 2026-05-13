import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import "@uploadthing/react/styles.css";

import { authOptions } from "../../api/auth/[...nextauth]/options";
import SideBar from "../../../components/dashboard/side-bar";
import { MobileSidebar } from "@/components/dashboard/mobile-nav";
import SessionProvider from "@/components/session-provider/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSidebarNav } from "./lib/config/dashboard-navigation";
import { getProducerById } from "@/lib/api/producers";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Plataforma de venta de entradas online",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/");
  }

  const sidebarNav = getSidebarNav(
    session.user.role,
    session.user.isSuperAdmin,
  );

  const producer = session.user.producerId
    ? await getProducerById(session.user.producerId)
    : null;

  return (
    <>
      <SessionProvider session={session}>
        <MobileSidebar items={sidebarNav} />
        <div className="flex min-h-svh gap-8 py-2 p-4 md:pl-0 md:py-8 mx-auto w-full bg-white">
          <div className="bg-neutral-900 text-neutral-50 max-md:hidden w-[200px] lg:w-[240px] flex-shrink-0 fixed top-0 h-svh flex flex-col overflow-y-auto shadow-md">
            <SideBar
              session={session}
              items={sidebarNav}
              producerName={producer?.name ?? null}
            />
          </div>
          <div className="flex flex-col md:ml-[200px] lg:ml-[240px] flex-1 pb-12 pl-10 min-w-0">
            {children}
          </div>
        </div>
        <Toaster />
      </SessionProvider>
    </>
  );
}
