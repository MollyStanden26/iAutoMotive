"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconSidebar } from "@/components/admin/icon-sidebar";
import { AddStaffDrawer, type StaffEdit } from "@/components/admin/add-staff-drawer";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const T = {
  bgPage: "#0B111E", bgCard: "#0D1525", bgSidebar: "#070D18",
  bgRow: "#111D30", bgHover: "#0C1428", border: "#1E2D4A", border2: "#0F1828",
  textPrimary: "#F1F5F9", textSecondary: "#8492A8", textMuted: "#6B7A90", textDim: "#4A556B",
  teal: "#008C7C", teal200: "#4DD9C7",
  green: "#34D399", greenBg: "#0B2B1A",
  amber: "#FCD34D", amberBg: "#2B1A00",
  red: "#F87171", redBg: "#2B0F0F",
  indigo: "#0A1A2E", indigoBorder: "#1E3A5F",
};

const ROLE_LABEL: Record<string, string> = {
  "super-admin": "Super admin", "site-manager": "Site manager", finance: "Finance",
  sales: "Sales", "recon-tech": "Recon tech", compliance: "Compliance", "read-only": "Read only",
};

interface StaffRow {
  id: string; name: string; firstName: string; lastName: string; email: string; role: string;
  lot: string | null; lotId: string | null; isActive: boolean; isRemote: boolean;
  lastLoginAt: string | null; hireDate: string | null;
  dailyCallTarget: number | null; weeklyConversionTarget: number | null;
}

function relTime(iso: string | null): string {
  if (!iso) return "Never";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */
function Topbar({ onAddStaff }: { onAddStaff: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 58, background: T.bgSidebar, borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        <span className="cursor-pointer" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.textDim }} onClick={() => router.push("/admin")}>Admin</span>
        <span style={{ color: T.textDim, fontSize: 13 }}>/</span>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, color: T.textPrimary }}>Staff</span>
      </div>
      <button className="px-[14px] py-[6px] rounded-[8px] hover:opacity-80" style={{ background: "#0A2A26", color: T.teal200, border: "1px solid #1E3A34", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }} onClick={onAddStaff}>+ Add staff</button>
    </div>
  );
}

/* ================================================================== */
/*  KPI STRIP — real counts from the live staff list                  */
/* ================================================================== */
function StaffKpiStrip({ staff, lotCount }: { staff: StaffRow[]; lotCount: number }) {
  const total = staff.length;
  const active = staff.filter(s => s.isActive).length;
  const inactive = total - active;
  const sales = staff.filter(s => s.role === "sales").length;
  const remote = staff.filter(s => s.isRemote).length;
  const cards = [
    { label: "TOTAL STAFF", value: total.toString(), valueColor: T.textPrimary, delta: `Across ${lotCount} lot${lotCount === 1 ? "" : "s"}`, deltaColor: T.textMuted },
    { label: "ACTIVE", value: active.toString(), valueColor: T.teal200, delta: inactive > 0 ? `${inactive} inactive` : "All active", deltaColor: inactive > 0 ? T.amber : T.green },
    { label: "SALES REPS", value: sales.toString(), valueColor: T.green, delta: `of ${total} staff`, deltaColor: T.textMuted },
    { label: "REMOTE", value: remote.toString(), valueColor: T.textPrimary, delta: `${total - remote} on-site`, deltaColor: T.textMuted },
    { label: "LOTS", value: lotCount.toString(), valueColor: T.textPrimary, delta: "Operating", deltaColor: T.textMuted },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} className="px-[14px] py-[11px] rounded-[10px] transition-colors duration-200" style={{ background: T.bgCard, border: `1px solid ${T.border}` }} onMouseEnter={e => (e.currentTarget.style.borderColor = T.indigoBorder)} onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: "-0.02em", color: c.valueColor }}>{c.value}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: c.deltaColor, marginTop: 3 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  ROLE BREAKDOWN — real counts by role                              */
/* ================================================================== */
function RoleBreakdown({ staff }: { staff: StaffRow[] }) {
  const counts = new Map<string, number>();
  staff.forEach(s => counts.set(s.role, (counts.get(s.role) ?? 0) + 1));
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = staff.length || 1;
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Role breakdown</span>
      </div>
      <div style={{ padding: "4px 0" }}>
        {rows.length === 0 && <div className="text-center py-6" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No staff yet.</div>}
        {rows.map(([role, count], idx) => (
          <div key={role} className="flex items-center gap-[8px] px-[14px] py-[6px]" style={{ borderBottom: idx < rows.length - 1 ? "1px solid #0C1428" : "none" }}>
            <span className="rounded-full text-center flex-shrink-0" style={{ width: 96, padding: "2px 7px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, background: T.bgRow, color: T.teal200 }}>{ROLE_LABEL[role] ?? role}</span>
            <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: T.bgRow }}>
              <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, background: T.teal }} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: T.textPrimary, minWidth: 20, textAlign: "right" }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STAFF ROSTER — real staff + management actions                    */
/* ================================================================== */
function StaffRoster({ staff, onEdit, onChanged }: { staff: StaffRow[]; onEdit: (s: StaffEdit) => void; onChanged: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reset, setReset] = useState<{ name: string; email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetPw = async (s: StaffRow) => {
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/admin/staff/${s.id}/reset-password`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setReset({ name: s.name, email: s.email, tempPassword: d.tempPassword });
    } finally { setBusyId(null); }
  };

  const toggleActive = async (s: StaffRow) => {
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/admin/staff/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !s.isActive }) });
      if (res.ok) onChanged();
    } finally { setBusyId(null); }
  };

  const toEdit = (s: StaffRow): StaffEdit => ({
    id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email, role: s.role,
    lotId: s.lotId, dailyCallTarget: s.dailyCallTarget, weeklyConversionTarget: s.weeklyConversionTarget,
    isRemote: s.isRemote, hireDate: s.hireDate,
  });

  const ActBtn = ({ label, onClick, color, disabled }: { label: string; onClick: () => void; color: string; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color, background: "transparent", border: "none", cursor: disabled ? "wait" : "pointer", padding: "2px 4px", opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>Staff roster — {staff.length} member{staff.length === 1 ? "" : "s"}</span>
        <span className="ml-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: T.textMuted }}>All lots · All roles</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              {["Name", "Role", "Lot", "Last login", "Status", ""].map((h, i) => (
                <th key={i} className="px-[10px] py-[6px] text-left" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSidebar, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr><td colSpan={6} className="px-[10px] py-6 text-center" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.textMuted }}>No staff yet. Use “+ Add staff” to create the first account.</td></tr>
            )}
            {staff.map((s, idx) => {
              const last = idx === staff.length - 1;
              const border = last ? "transparent" : T.border2;
              const dim = !s.isActive;
              return (
                <tr key={s.id}>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}` }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: dim ? T.textMuted : T.textPrimary }}>{s.name}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: T.textDim }}>{s.email}</div>
                  </td>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textSecondary }}>{ROLE_LABEL[s.role] ?? s.role}{s.isRemote ? " · Remote" : ""}</td>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}`, fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted }}>{s.lot ?? "—"}</td>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}`, fontFamily: "var(--font-body)", fontSize: 11, color: s.lastLoginAt ? T.textSecondary : T.textDim }}>{relTime(s.lastLoginAt)}</td>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}` }}>
                    <span className="rounded-full px-[7px] py-[2px]" style={{ background: s.isActive ? T.greenBg : T.redBg, color: s.isActive ? T.green : T.red, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9 }}>{s.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-[10px] py-[7px] align-middle" style={{ borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>
                    <ActBtn label="Edit" color={T.teal200} onClick={() => onEdit(toEdit(s))} disabled={busyId === s.id} />
                    <ActBtn label="Reset PW" color={T.textSecondary} onClick={() => resetPw(s)} disabled={busyId === s.id} />
                    <ActBtn label={s.isActive ? "Deactivate" : "Activate"} color={s.isActive ? T.red : T.green} onClick={() => toggleActive(s)} disabled={busyId === s.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reset && (
        <div className="flex items-center justify-center" style={{ position: "fixed", inset: 0, background: "rgba(7,13,24,0.65)", zIndex: 70 }} onClick={() => setReset(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 380, maxWidth: "90vw", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15, color: T.textPrimary, marginBottom: 4 }}>New password for {reset.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.textMuted, marginBottom: 12 }}>Shown once. Share securely; ask them to change it after signing in.</div>
            <div style={{ background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3 }}>{reset.email}</div>
              <div className="flex items-center gap-2">
                <code style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: T.teal200, letterSpacing: "0.5px" }}>{reset.tempPassword}</code>
                <button onClick={() => { navigator.clipboard?.writeText(reset.tempPassword); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  style={{ background: "#0A2A26", border: `1px solid ${T.teal}`, color: T.teal200, borderRadius: 7, padding: "3px 10px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setReset(null)} style={{ background: "#0A2A26", border: `1px solid ${T.teal}`, color: T.teal200, borderRadius: 8, padding: "7px 16px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [lotCount, setLotCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffEdit | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/staff", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) setStaff(d.staff ?? []); })
      .catch(e => { if (!cancelled) console.error("[StaffPage] staff fetch failed:", e); });
    fetch("/api/admin/lots", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : { lots: [] }))
      .then(d => { if (!cancelled) setLotCount((d.lots ?? []).length); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: T.bgPage }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onAddStaff={() => setAddStaffOpen(true)} />
        <div className="flex-1 flex flex-col gap-[10px] overflow-x-hidden" style={{ padding: "14px 20px" }}>
          <StaffKpiStrip staff={staff} lotCount={lotCount} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 10 }}>
            <StaffRoster staff={staff} onEdit={s => setEditStaff(s)} onChanged={refresh} />
            <RoleBreakdown staff={staff} />
          </div>
        </div>
      </div>
      <AddStaffDrawer
        open={addStaffOpen || !!editStaff}
        staff={editStaff}
        onClose={() => { setAddStaffOpen(false); setEditStaff(null); }}
        onCreated={refresh}
      />
    </div>
  );
}
