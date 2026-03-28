interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

// Tooltip — Slate 900 bg, Inter 400 12px white, 8px radius, 8px 12px padding
// Arrow: CSS border triangle, 5px. Position above by default, flips below if <60px from top.
// Animation: opacity 0→1 + translateY(4px→0) 180ms ease
export function Tooltip({ content, children }: TooltipProps) {
  return <span>{children}</span>;
}
