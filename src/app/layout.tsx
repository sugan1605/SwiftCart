import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next E-Commerce",
  description: "A modern e-commerce app built with Next.js, TypeScript, Redux Toolkit and Prisma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black dark:bg-black dark:text-white`}>
        <ReduxProvider>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        </ReduxProvider>
      </body>
    </html>
  );
}
