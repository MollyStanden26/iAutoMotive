import { DealerNavbar } from "@/components/dealer/navbar";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DealerNavbar />
      <main>{children}</main>
    </>
  );
}
