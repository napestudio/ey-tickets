import "./global.css";
import type { Metadata } from "next";
import NavBar from "@/components/nav-bar/nav-bar";

import Footer from "@/components/footer/footer";
import { Toaster } from "@/components/ui/toaster";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import PreFooter from "@/components/pre-footer/pre-footer";
import localFont from "next/font/local";


const nebulica = localFont({
  src: [
    {
      path: "../public/fonts/Nebulica-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/Nebulica-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-nebulica",
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
      <body
        className={`${nebulica.variable} bg-background text-foreground font-nebulica`}
      >
        <NavBar />
        <main className="flex flex-col ">{children}</main>
        <PreFooter />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
