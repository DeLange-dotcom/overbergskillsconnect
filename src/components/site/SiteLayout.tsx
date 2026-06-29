import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import overbergLogo from "@/assets/overberg-logo.png.asset.json";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-brand-page text-brand-dark overflow-hidden">
      {/* Subtle logo watermark */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
      >
        <img
          src={overbergLogo.url}
          alt=""
          className="w-[min(80vw,900px)] max-w-none opacity-[0.04] select-none"
        />
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
