import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ConnectMark } from "@/components/brand/Logo";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-brand-page text-brand-navy overflow-hidden">
      {/* Subtle brand watermark */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
      >
        <ConnectMark className="w-[min(55vw,420px)] opacity-[0.025] select-none" />
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
