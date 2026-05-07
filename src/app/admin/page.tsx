"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { commandCentreData as D } from "@/lib/admin/mock-data";
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Zap } from "lucide-react";
import { IconSidebar } from "@/components/admin/icon-sidebar";

/* ================================================================== */
/*  TOPBAR                                                             */
/* ================================================================== */

function Topbar() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setTime(`${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} GMT`);
    };
    fmt();
    const iv = setInterval(fmt, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="sticky top-0 z-10 flex items-center h-14 px-6 gap-4" style={{ background: "#070D18", borderBottom: "1px solid #1A2640" }}>
      <h1 className="text-[17px] font-extrabold text-[#E2E8F4]" style={{ fontFamily: "var(--font-heading)" }}>
        Command centre
      </h1>
      <span className="text-[13px] text-[#94A3BB]">· Super Admin</span>

      <div className="flex items-center gap-1.5 ml-6 rounded-full px-2.5 py-1" style={{ background: "#0D2010" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#34D399]">Live</span>
      </div>
      <span className="text-[12px] font-mono text-[#94A3BB]">{time}</span>

      <div className="flex-1" />
      <a href="#copilot" className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-[#C5CDD8] transition-colors hover:bg-[#172D4D] hover:text-[#E2E8F4]" style={{ background: "#111D30" }}>
        <Zap size={13} /> Ask AI ↗
      </a>
      <button className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-[#C5CDD8] transition-colors hover:bg-[#172D4D] hover:text-[#E2E8F4]" style={{ background: "#111D30" }}>
        Export
      </button>
    </div>
  );
}

/* ================================================================== */
/*  HEALTH SCORE BAR                                                   */
/* ================================================================== */

function HealthScoreBar() {
  const [fill, setFill] = useState(0);
  useEffect(() => { const t = setTimeout(() => setFill(D.health.score), 100); return () => clearTimeout(t); }, []);
  const chipColours = { green: { bg: "#0D2010", text: "#34D399", dot: "#34D399" }, amber: { bg: "#1F1500", text: "#FCD34D", dot: "#FCD34D" }, red: { bg: "#1A0505", text: "#F87171", dot: "#F87171" } };

  return (
    <div className="flex items-center gap-4 rounded-[14px] px-6 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex-shrink-0 text-center">
        <p className="text-[48px] font-black leading-none tracking-tight text-[#4DD9C7]" style={{ fontFamily: "var(--font-heading)" }}>
          {D.health.score}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3BB] mt-0.5">Platform health</p>
      </div>
      <div className="flex-1 mx-2 h-2 rounded-full overflow-hidden" style={{ background: "#1A2640" }}>
        <div className="h-full rounded-full bg-[#4DD9C7] transition-all duration-700 ease-out" style={{ width: `${fill}%` }} />
      </div>
      <div className="flex gap-2 flex-wrap ml-auto flex-shrink-0">
        {D.health.chips.map((chip) => {
          const c = chipColours[chip.variant];
          return (
            <span key={chip.label} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: c.bg, color: c.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
              {chip.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  KPI ROW                                                            */
/* ================================================================== */

function KpiRow() {
  const router = useRouter();
  const deltaColours = { up: "#34D399", down: "#F87171", warn: "#FCD34D", neutral: "#A0AEBF" };

  return (
    <div className="grid grid-cols-4 gap-3">
      {D.kpis.map((kpi) => (
        <div
          key={kpi.eyebrow}
          className="relative overflow-hidden rounded-[14px] px-5 py-5 cursor-pointer transition-all duration-200 hover:bg-[#0C1428]"
          style={{ background: "#0A1020", border: "1px solid #1A2640" }}
          onClick={() => router.push(kpi.href)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1E3A5F"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A2640"; }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3BB] mb-2.5">{kpi.eyebrow}</p>
          <p className="text-[36px] font-black leading-none tracking-tight mb-2" style={{ fontFamily: "var(--font-heading)", color: kpi.accent }}>{kpi.value}</p>
          <p className="text-[13px] font-semibold" style={{ color: deltaColours[kpi.deltaType] }}>{kpi.delta}</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[14px] opacity-40" style={{ background: kpi.accent }} />
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  REVENUE CHART                                                      */
/* ================================================================== */

function RevenueChart() {
  return (
    <div className="rounded-[14px] px-5 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#E2E8F4]">Revenue — 14 days</p>
        <Link href="/admin/finance" className="text-[11px] font-semibold text-[#4DD9C7] hover:underline">Full report →</Link>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={D.revenue} barCategoryGap="30%" barGap={2}>
          <CartesianGrid vertical={false} stroke="#111D30" strokeDasharray="0" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3BB" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#070D18", border: "1px solid #1A2640", borderRadius: 8, fontSize: 12, color: "#E2E8F4" }}
            formatter={(value: any) => [`£${value}k`, ""]}
            labelStyle={{ color: "#C5CDD8" }}
          />
          <Bar dataKey="prev" fill="#1A2640" radius={[4, 4, 0, 0]} name="Prior period" />
          <Bar
            dataKey="curr"
            radius={[4, 4, 0, 0]}
            name="Current"
            fill="#008C7C"
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return <rect x={x} y={y} width={width} height={height} rx={4} fill={payload.isToday ? "#4DD9C7" : "#008C7C"} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-[#A0AEBF]"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#1A2640" }} />Prior period</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#A0AEBF]"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#008C7C" }} />Current</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DEAL PIPELINE                                                      */
/* ================================================================== */

function DealPipeline() {
  return (
    <div className="rounded-[14px] px-5 py-4" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#E2E8F4]">Deal pipeline</p>
        <Link href="/admin/deals" className="text-[11px] font-semibold text-[#4DD9C7] hover:underline">View all →</Link>
      </div>
      <div>
        {D.pipeline.map((row, i) => (
          <div key={row.stage} className="grid items-center gap-3 py-2.5" style={{ gridTemplateColumns: "1fr auto auto", borderBottom: i < D.pipeline.length - 1 ? "1px solid #111D30" : "none" }}>
            <div>
              <p className="text-[13px] font-semibold text-[#C5CDD8] mb-1">{row.stage}</p>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "#1A2640" }}>
                <div className="h-full rounded-full" style={{ width: `${row.barPct}%`, background: row.barColor }} />
              </div>
            </div>
            <p className="text-[20px] font-black text-[#E2E8F4] text-right min-w-[28px]" style={{ fontFamily: "var(--font-heading)" }}>{row.count}</p>
            <p className="text-[12px] text-[#A0AEBF] text-right min-w-[62px]">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2.5 mt-0.5" style={{ borderTop: "1px solid #1A2640" }}>
        <span className="text-[12px] text-[#A0AEBF]">{D.pipelineTotal.count} deals total</span>
        <span className="text-[15px] font-black text-[#4DD9C7]" style={{ fontFamily: "var(--font-heading)" }}>{D.pipelineTotal.value} pipeline</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AI BRIEFING                                                        */
/* ================================================================== */

function AiBriefing() {
  return (
    <div className="rounded-[14px] flex flex-col" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #1A2640" }}>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#4DD9C7] animate-pulse" />
          <span className="text-[13px] font-bold text-[#E2E8F4]">AI daily briefing</span>
        </div>
        <span className="text-[11px] text-[#94A3BB]">{D.briefing.time}</span>
      </div>
      <div className="px-4 py-3.5 flex-1">
        <div className="space-y-3">
          {D.briefing.paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] text-[#C5CDD8] leading-relaxed" dangerouslySetInnerHTML={{ __html: p.replace(/<strong>/g, '<strong class="font-semibold text-[#E2E8F4]">') }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {D.briefing.chips.map((chip) => (
            <Link key={chip.label} href={chip.href} className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#C5CDD8] transition-colors hover:bg-[#172D4D] hover:text-[#E2E8F4]" style={{ background: "#111D30" }}>
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ANOMALY ALERTS                                                     */
/* ================================================================== */

function AnomalyAlerts() {
  const dotColours = { red: "#F87171", amber: "#FCD34D", green: "#34D399" };
  const critCount = D.alerts.filter((a) => a.variant === "red").length;
  const warnCount = D.alerts.filter((a) => a.variant === "amber").length;

  return (
    <div className="rounded-[14px] flex flex-col" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #1A2640" }}>
        <span className="text-[13px] font-bold text-[#E2E8F4]">Anomaly alerts</span>
        <span className="text-[11px] font-bold text-[#F87171]">{critCount} critical · {warnCount} warnings</span>
      </div>
      <div className="px-4 py-2">
        {D.alerts.map((alert, i) => (
          <div key={i} className="flex gap-2.5 items-start py-2" style={{ borderBottom: i < D.alerts.length - 1 ? "1px solid #111D30" : "none" }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: dotColours[alert.variant] }} />
            <div>
              <p className="text-[12px] text-[#C5CDD8] leading-snug" dangerouslySetInnerHTML={{ __html: alert.message.replace(/<strong>/g, '<strong class="font-semibold text-[#E2E8F4]">') }} />
              <p className="text-[10px] text-[#94A3BB] mt-0.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FORECAST SNAPSHOT                                                  */
/* ================================================================== */

function ForecastSnapshot() {
  const deltaColours = { up: "#34D399", neutral: "#A0AEBF" };
  return (
    <div className="rounded-[14px] px-4 py-3.5" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <p className="text-[13px] font-bold text-[#E2E8F4] mb-3">Forecast</p>
      <div className="grid grid-cols-3 gap-2">
        {D.forecast.map((f) => (
          <div key={f.period} className="rounded-[10px] p-3" style={{ background: "#111D30" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3BB] mb-1.5">{f.period}</p>
            <p className="text-[22px] font-black text-[#4DD9C7] leading-none tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{f.value}</p>
            <p className="text-[11px] font-semibold mt-1" style={{ color: deltaColours[f.deltaType] }}>{f.delta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AGENT STATUS                                                       */
/* ================================================================== */

function AgentStatus() {
  const onlineCount = D.agents.filter((a) => a.status === "online").length;
  return (
    <div className="rounded-[14px] px-4 py-3.5" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#E2E8F4]">AI agents</p>
        <span className="text-[11px] font-semibold text-[#34D399]">{onlineCount} of {D.agents.length} running</span>
      </div>
      <div className="space-y-2">
        {D.agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-2.5">
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: agent.status === "online" ? "#34D399" : "#94A3BB" }} />
            <span className={`text-[13px] font-semibold flex-1 ${agent.status === "paused" ? "text-[#94A3BB]" : "text-[#C5CDD8]"}`}>{agent.name}</span>
            <span className={`text-[12px] ${agent.status === "paused" ? "text-[#F87171]" : "text-[#A0AEBF]"}`}>{agent.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  AI COPILOT                                                         */
/* ================================================================== */

function AiCopilot() {
  const [messages, setMessages] = useState(D.copilotMessages);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "I'm processing your request. Based on the current data, I'll have an answer for you shortly. Is there anything specific you'd like me to prioritise?" },
      ]);
    }, 800);
  };

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  return (
    <div id="copilot" className="rounded-[14px] flex flex-col" style={{ background: "#0A1020", border: "1px solid #1A2640" }}>
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #1A2640" }}>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-[13px] font-bold text-[#E2E8F4]">AI Copilot</span>
        </div>
        <span className="text-[11px] font-semibold text-[#34D399]">Online</span>
      </div>
      <div ref={threadRef} className="flex flex-col gap-2 px-4 py-3 overflow-y-auto" style={{ maxHeight: 220 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="rounded-[10px] px-3 py-2.5 text-[12px] leading-relaxed"
            style={{
              maxWidth: "88%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#172D4D" : "#111D30",
              color: msg.role === "user" ? "#E2E8F4" : "#C5CDD8",
              borderRadius: msg.role === "user" ? "10px 0 10px 10px" : "0 10px 10px 10px",
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-4 pb-4 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          className="flex-1 rounded-lg px-3 py-2 text-[13px] text-[#E2E8F4] placeholder:text-[#94A3BB] outline-none transition-colors focus:border-[#008C7C]"
          style={{ background: "#111D30", border: "1px solid #1A2640" }}
        />
        <button onClick={send} className="rounded-lg px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#006058]" style={{ background: "#008C7C" }}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */

export default function AdminCommandCentre() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "#0B111E" }}>
      <IconSidebar />
      <div className="flex-1 flex flex-col min-w-[1024px]">
        <Topbar />
        <div
          className="flex-1 flex flex-col gap-5 p-6 transition-all duration-400 ease-out"
          style={{
            background: "#0B111E",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {/* Health score bar */}
          <HealthScoreBar />

          {/* KPI row */}
          <KpiRow />

          {/* Middle row: Revenue · Pipeline · AI Briefing */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "1fr 1fr 340px" }}>
            <RevenueChart />
            <DealPipeline />
            <AiBriefing />
          </div>

          {/* Bottom row: Alerts · [Forecast + Agents] · Copilot */}
          <div className="grid grid-cols-3 gap-3.5">
            <AnomalyAlerts />
            <div className="flex flex-col gap-3.5">
              <ForecastSnapshot />
              <AgentStatus />
            </div>
            <AiCopilot />
          </div>
        </div>
      </div>
    </div>
  );
}
