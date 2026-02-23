import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FinResearch Pro",
  description: "Professional Financial Research Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
