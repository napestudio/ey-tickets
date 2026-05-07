import "./global.scss";
import type { Metadata } from "next";
import NavBar from "@/components/nav-bar/nav-bar";

import Footer from "@/components/footer/footer";
import { Toaster } from "@/components/ui/toaster";

import { Montserrat } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import PreFooter from "@/components/pre-footer/pre-footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900", "700", "500", "400"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | Entradas online`,
  description: `${SITE_DESCRIPTION}`,
  // openGraph: { images: { url: "/og.jpg" } },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        <NavBar />
        <main className="flex flex-col items-center bg-blue">{children}</main>
        <PreFooter />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
