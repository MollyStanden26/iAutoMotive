"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidth = pathname === "/admin" || pathname.startsWith("/admin/crm") || pathname.startsWith("/admin/analytics") || pathname.startsWith("/admin/sellers-management") || pathname.startsWith("/admin/inventory") || pathname.startsWith("/admin/deals") || pathname.startsWith("/admin/payouts") || pathname.startsWith("/admin/compliance") || pathname.startsWith("/admin/finance") || pathname.startsWith("/admin/staff") || pathname.startsWith("/admin/settings");

  return (
    <div data-theme="dark" className="flex min-h-screen">
      {!isFullWidth && <AdminSidebar />}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
