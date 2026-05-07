"use client";

import { useEffect, useMemo, useState } from "react";
import { SupportTopbar, SUPPORT_TOKENS as T } from "@/components/support/topbar";
import { SUPPORT_TICKETS } from "@/lib/support/mock-data";

interface ApiSeller {
  id: string;
  email: string;
  name: string;
  vehicle: {
    registration: string;
    year: number | null;
    make: string;
    model: string;
    trim: string;
    askingPriceGbp: number | null;
  } | null;
}

export default function SupportSellersPage() {
  const [sellers, setSellers] = useState<ApiSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/sellers")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setSellers(data.sellers ?? []); })
      .catch(err => { if (!cancelled) console.error("[support/sellers] fetch failed:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Index tickets by seller name so each row can show open-ticket count.
  const ticketsByName = useMemo(() => {
    const map = new Map<string, { open: number; total: number }>();
    for (const t of SUPPORT_TICKETS) {
      const cur = map.get(t.sellerName) ?? { open: 0, total: 0 };
      cur.total += 1;
      if (t.status === "open" || t.status === "escalated") cur.open += 1;
      map.set(t.sellerName, cur);
    }
    return map;
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? sellers.filter(s =>
        `${s.name} ${s.email} ${s.vehicle?.make ?? ""} ${s.vehicle?.model ?? ""} ${s.vehicle?.registration ?? ""}`
          .toLowerCase().includes(q),
      )
    : sellers;

  return (
    <>
      <SupportTopbar />

      <div className="flex-1 flex flex-col gap-3 p-[18px_22px] overflow-y-auto overflow-x-hidden">
        {/* Filter row */}
        <div
          className="flex items-center gap-2 rounded-[14px] px-[15px] py-[11px]"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <span className="font-body text-[12px]" style={{ color: T.textMuted }}>
            {loading ? "Loading sellers…" : `${filtered.length} seller${filtered.length === 1 ? "" : "s"}`}
          </span>
          <div className="flex-1" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search seller, email, registration…"
            className="font-body text-[12px]"
            style={{
              width: 320, height: 32, padding: "0 12px",
              background: T.bgRow, border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.textPrimary, outline: "none",
            }}
          />
        </div>

        {/* Sellers table */}
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 900 }}>
              <colgroup>
                <col style={{ width: "26%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Seller", "Vehicle", "Reg", "Asking", "Tickets"].map((h, i) => (
                    <th
                      key={h}
                      className="font-body font-bold text-[10px] uppercase tracking-widest text-left pb-2 pt-2 px-[10px]"
                      style={{ color: T.textDim, paddingLeft: i === 0 ? 14 : undefined }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <span className="font-body text-[13px]" style={{ color: T.textDim }}>
                        No sellers match your search.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => {
                    const tickets = ticketsByName.get(s.name);
                    return (
                      <tr
                        key={s.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-[10px] px-[10px] pl-[14px]">
                          <div className="font-body font-semibold text-[13px]" style={{ color: T.textPrimary }}>
                            {s.name}
                          </div>
                          <div className="font-body text-[11px]" style={{ color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {s.email}
                          </div>
                        </td>
                        <td className="py-[10px] px-[10px]">
                          {s.vehicle ? (
                            <>
                              <div className="font-body text-[12px]" style={{ color: T.textPrimary }}>
                                {s.vehicle.year} {s.vehicle.make} {s.vehicle.model}
                              </div>
                              <div className="font-body text-[10px]" style={{ color: T.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {s.vehicle.trim}
                              </div>
                            </>
                          ) : (
                            <span className="font-body text-[12px]" style={{ color: T.textDim }}>—</span>
                          )}
                        </td>
                        <td className="py-[10px] px-[10px] font-body text-[11px]" style={{ color: T.textMuted }}>
                          {s.vehicle?.registration || "—"}
                        </td>
                        <td className="py-[10px] px-[10px] font-body text-[12px]" style={{ color: T.textPrimary }}>
                          {s.vehicle?.askingPriceGbp ? `£${s.vehicle.askingPriceGbp.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-[10px] px-[10px]">
                          {tickets ? (
                            <span
                              className="inline-block rounded-pill px-2 py-0.5 font-body font-bold text-[11px]"
                              style={{
                                background: tickets.open > 0 ? "#3B1820" : T.bgRow,
                                color: tickets.open > 0 ? T.red : T.textMuted,
                              }}
                            >
                              {tickets.open > 0 ? `${tickets.open} open` : `${tickets.total} closed`}
                            </span>
                          ) : (
                            <span className="font-body text-[11px]" style={{ color: T.textDim }}>None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
