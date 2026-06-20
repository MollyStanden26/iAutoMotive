// CRM Voice config — Telnyx WebRTC dialler status + per-agent number mapping.

import { prisma } from "@/lib/db/prisma";
import { dbRoleToAppRole } from "@/lib/auth/role-mapping";

export const dynamic = "force-dynamic";

const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18", bgRow: "#111D30",
  border: "#1E2D4A", textPrimary: "#F1F5F9", textSecondary: "#8492A8",
  textMuted: "#6B7A90", teal200: "#4DD9C7", green: "#34D399", greenBg: "#0B2B1A",
  amber: "#FCD34D", amberBg: "#2B1A00", red: "#F87171",
};

function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between"
      style={{ padding: "10px 0", borderBottom: `1px solid ${T.bgRow}` }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{label}</div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{hint}</div>
      </div>
      <span style={{ background: ok ? T.greenBg : T.amberBg, color: ok ? T.green : T.amber,
        borderRadius: 999, padding: "2px 9px", fontSize: 9, fontWeight: 700 }}>
        {ok ? "Set" : "Missing"}
      </span>
    </div>
  );
}

export default async function SettingsCrmPage() {
  const hasApiKey = Boolean(process.env.TELNYX_API_KEY);
  const hasConnection = Boolean(process.env.TELNYX_CONNECTION_ID);
  const hasPublicKey = Boolean(process.env.TELNYX_PUBLIC_KEY);
  const hasFallbackCli = Boolean(process.env.TELNYX_DEFAULT_CALLER_ID);

  const numbers = await prisma.telnyxPhoneNumber
    .findMany({
      orderBy: { createdAt: "asc" },
      include: { assignedUser: { include: { staffProfile: true } } },
    })
    .catch(() => []);

  const liveReady = hasApiKey && hasConnection;

  return (
    <div style={{ background: T.bgPage, minHeight: "100vh", padding: 24, fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>CRM Voice (Telnyx)</h1>
      <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
        WebRTC softphone for the sales team. Per-agent caller ID + inbound callback routing.
      </p>

      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        <span style={{ background: liveReady ? T.greenBg : T.amberBg, color: liveReady ? T.green : T.amber,
          borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>
          {liveReady ? "● Live" : "● Not configured"}
        </span>
        {!liveReady && (
          <span style={{ fontSize: 11, color: T.textMuted }}>
            Add the Telnyx environment variables to enable calling.
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Config checklist */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.teal200, marginBottom: 6 }}>Configuration</div>
          <Check ok={hasApiKey} label="API key" hint="TELNYX_API_KEY — mints credentials & tokens" />
          <Check ok={hasConnection} label="WebRTC connection" hint="TELNYX_CONNECTION_ID — rep softphones register here" />
          <Check ok={hasPublicKey} label="Webhook public key" hint="TELNYX_PUBLIC_KEY — verifies inbound events" />
          <Check ok={hasFallbackCli} label="Fallback caller ID" hint="TELNYX_DEFAULT_CALLER_ID — reps with no DID yet" />
        </div>

        {/* Per-agent numbers */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.teal200, marginBottom: 10 }}>
            Per-agent numbers ({numbers.length})
          </div>
          {numbers.length === 0 && (
            <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
              No Telnyx numbers synced yet. Buy UK DIDs in Mission Control, then assign each to a
              rep — their outbound calls present that number and callbacks to it ring their softphone.
            </p>
          )}
          {numbers.map(n => {
            const rep = n.assignedUser;
            const name = rep?.staffProfile
              ? `${rep.staffProfile.firstName} ${rep.staffProfile.lastName}`
              : rep
                ? dbRoleToAppRole(rep.role)
                : null;
            return (
              <div key={n.id} className="flex items-center justify-between"
                style={{ padding: "7px 0", borderBottom: `1px solid ${T.bgRow}` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{n.phoneNumber}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>{n.numberType.replace(/_/g, " ")}</div>
                </div>
                <span style={{ fontSize: 11, color: name ? T.teal200 : T.textMuted }}>
                  {name ?? "Unassigned"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
