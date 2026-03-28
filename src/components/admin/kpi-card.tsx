interface KpiCardProps {
  label: string;
  value: string | number;
  variant?: "positive" | "neutral" | "flagged";
}

// KPI card — Slate 50 bg, 16px radius, PJS 800 number, Inter 600 uppercase label
// Positive: Teal 200. Neutral: Slate 200. Flagged: Amber 200.
// Hover: Teal 50 bg + translateY(-2px)
export function KpiCard({ label, value, variant = "neutral" }: KpiCardProps) {
  return <div>{value}</div>;
}
