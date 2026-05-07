"use client";

import { SupportIconSidebar } from "@/components/support/icon-sidebar";

const BG_PAGE = "#0A1226";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="flex min-h-screen" style={{ background: BG_PAGE }}>
      <SupportIconSidebar />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
