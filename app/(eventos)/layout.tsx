import type { Metadata } from "next";

import NavBar from "@/components/nav-bar/nav-bar";

import Footer from "@/components/footer/footer";
import { Toaster } from "@/components/ui/toaster";

import PreFooter from "@/components/pre-footer/pre-footer";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import SmoothScrollProvider from "@/lib/smoothScrollProvider";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Eventos`,
  description: `${SITE_DESCRIPTION}`,
  // openGraph: { images: { url: "/og.jpg" } },
};

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      {/* <NavBar /> */}
      <main className="flex flex-col ">{children}</main>
      <PreFooter />
      <Footer />
      <Toaster />
    </SmoothScrollProvider>
  );
}
