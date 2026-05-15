import "./global.css";
import type { Metadata } from "next";
import NavBar from "@/components/nav-bar/nav-bar";

import Footer from "@/components/footer/footer";
import { Toaster } from "@/components/ui/toaster";

import { Montserrat } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import PreFooter from "@/components/pre-footer/pre-footer";
import localFont from "next/font/local";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900", "700", "500", "400"],
});

const baseNeue = localFont({
  src: [
    {
      path: "../public/fonts/BaseNeueTrial-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/BaseNeueTrial-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/BaseNeueTrial-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/BaseNeueTrial-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/BaseNeueTrial-ExtraBold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-base-neue",
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
        className={`${montserrat.className} ${baseNeue.variable} bg-background text-foreground`}
      >
        <NavBar />
        <main className="flex flex-col">{children}</main>
        <PreFooter />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
