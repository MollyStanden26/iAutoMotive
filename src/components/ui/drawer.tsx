interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Side panel / drawer — 300-360px, fixed right, full viewport height
// White bg, 0 20px 20px 0 border-radius on left edge
// Overlay: rgba(15,23,36,0.45). Click overlay or Escape to close.
// Animation: translateX(100%→0) 300ms cubic-bezier(.25,.46,.45,.94)
export function Drawer({ open, onClose, children }: DrawerProps) {
  if (!open) return null;
  return <aside>{children}</aside>;
}
