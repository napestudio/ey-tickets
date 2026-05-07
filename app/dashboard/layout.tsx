import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import "@uploadthing/react/styles.css";

import { authOptions } from "../api/auth/[...nextauth]/options";
import SideBar from "../../components/dashboard/side-bar";
import { MobileSidebar } from "@/components/dashboard/mobile-nav";
import SessionProvider from "@/components/session-provider/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSidebarNav } from "./lib/config/dashboard-navigation";
import { UserType } from "@/types/user";

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

  const sidebarNav = getSidebarNav(session.user.type as UserType);

  return (
    <>
      <SessionProvider session={session}>
        <MobileSidebar items={sidebarNav} />
        <div className="flex min-h-svh gap-8 py-2 p-4 md:py-8 mx-auto w-full bg-white">
          <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
            <SideBar session={session} items={sidebarNav} />
          </aside>
          <div className="flex flex-col flex-1 pb-12">{children}</div>
        </div>
        <Toaster />
      </SessionProvider>
    </>
  );
}
