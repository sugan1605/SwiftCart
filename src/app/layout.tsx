import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderServer from "@/components/layout/HeaderServer";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";
import CartHydrator from "@/components/cart/CartHydrator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SwiftCart",
  description: "Headless e-commerce platform built with Next.js, Shopify & Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-black dark:bg-black dark:text-white`}
      >
        <ReduxProvider>
          {/* Synk Shopify cart -> Redux ved refresh/reload */}
          <CartHydrator>
            <HeaderServer />
            <main className="min-h-screen">{children}</main>
          </CartHydrator>
        </ReduxProvider>
      </body>
    </html>
  );
}
