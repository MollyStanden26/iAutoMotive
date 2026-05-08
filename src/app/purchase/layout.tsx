import PurchaseShell from "./_shell";

/**
 * The /purchase/* segment is per-user (sidebar reads the buyer's vehicleId
 * from the URL, fetches /api/buyer/* for the form state) and middleware
 * already gates it on a session — there's no useful static output. Marking
 * the whole segment dynamic here means the client shell can use
 * useSearchParams() at the top level without each child page needing its
 * own Suspense boundary.
 */
export const dynamic = "force-dynamic";

export default function PurchaseLayout({ children }: { children: React.ReactNode }) {
  return <PurchaseShell>{children}</PurchaseShell>;
}
