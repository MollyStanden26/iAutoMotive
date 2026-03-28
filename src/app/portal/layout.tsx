import { PortalNavbar } from "@/components/portal/navbar";

export default function SellerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalNavbar />
      <main>{children}</main>
    </>
  );
}
