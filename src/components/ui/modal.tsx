interface ModalProps {
  open: boolean;
  onClose: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}

// Modal — max 440px, centered, 24px radius, 24px padding
// Overlay: rgba(15,23,36,0.50). Destructive: overlay click does NOT close.
// Animation: scale(0.95→1) + opacity(0→1) 250ms cubic-bezier(.25,.46,.45,.94)
export function Modal({ open, onClose, destructive, children }: ModalProps) {
  if (!open) return null;
  return <div>{children}</div>;
}
