type BadgeVariant =
  | "success"    // HPI Clear — bg #D1FAE5, text #065F46
  | "price"      // Below market — bg #FEF3C7, text #92400E
  | "active"     // Front-line live — bg Teal 50, text Teal 900
  | "warning"    // In reconditioning — bg #FEF3C7, text #78350F
  | "neutral"    // Under offer — bg Slate 100, text Slate 800
  | "error";     // Dispute — bg #FEE2E2, text #7F1D1D

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

// Badge — Inter 700 11px, 100px pill radius, 4px 9px padding, 5px dot indicator
export function Badge({ variant, children }: BadgeProps) {
  return <span>{children}</span>;
}
