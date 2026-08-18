import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";
import SideBar from "../../../components/dashboard/side-bar";
import { MobileSidebar } from "@/components/dashboard/mobile-nav";
import SessionProvider from "@/components/session-provider/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSidebarNav } from "./lib/config/dashboard-navigation";
import { getProducerById } from "@/lib/api/producers";
import UserVerificationToast from "./components/user-verification-toast/user-verification-toast";
import { ProducerStockInitializer } from "@/components/dashboard/producer-stock-initializer";

export const metadata: Metadata = {
  title: "Eytickets | Administración",
  description: "Plataforma de venta de entradas online",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/");
  }

  const sidebarNav = getSidebarNav(session.user.role);

  const producer = session.user.producerId
    ? await getProducerById(session.user.producerId)
    : null;

  return (
    <>
      <SessionProvider session={session}>
        <ProducerStockInitializer />
        <MobileSidebar
          items={sidebarNav}
          session={session}
          producerName={producer?.name ?? null}
          producerImage={producer?.logo ?? null}
        />
        <div className="flex min-h-svh gap-8 py-5 p-4 md:pl-0 md:py-8 mx-auto w-full bg-white">
          <div className="bg-neutral-900 text-neutral-50 max-md:hidden w-60 shrink-0 fixed top-0 h-svh flex flex-col overflow-y-auto shadow-md">
            <SideBar
              session={session}
              items={sidebarNav}
              producerName={producer?.name ?? null}
              producerImage={producer?.logo ?? null}
            />
          </div>
          <div className="flex flex-col md:ml-55 lg:ml-60  flex-1 pb-12 md:pl-10 min-w-0">
            {!session.user.emailVerified && <UserVerificationToast />}
            {children}
          </div>
        </div>
        <Toaster />
      </SessionProvider>
    </>
  );
}
