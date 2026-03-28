type CardVariant = "vehicle" | "feature" | "info" | "stat";

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

// Card — 20px radius (16px for stat), white bg, 1.5px Slate 100 border
// Vehicle: translateY(-4px) + Teal 400 border + shadow on hover
// Feature: coloured bg fill (Teal 600/Slate 900/Teal 50), no border on dark
// Info: Teal 600 border + shadow on hover, no translateY
// Stat: Slate 50 bg, no border, Teal 50 bg + translateY(-2px) on hover
export function Card({ variant = "info", children }: CardProps) {
  return <div>{children}</div>;
}
