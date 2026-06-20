import { Softphone } from "@/components/crm/softphone";

/**
 * CRM-scoped layout. Mounts the rep softphone on every /admin/crm screen so
 * outbound dialling and inbound callbacks are always one click away, while
 * keeping it off non-CRM admin pages (finance, compliance, etc.).
 *
 * The softphone stays idle until the rep clicks "Go online" — no surprise mic
 * prompt, and non-dialling staff simply never start it.
 */
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Softphone />
    </>
  );
}
