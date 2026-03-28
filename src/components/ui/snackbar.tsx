interface SnackbarProps {
  message: string;
  variant?: "success" | "error";
  open: boolean;
  onClose: () => void;
}

// Snackbar / toast — Slate 900 bg, Inter 500 14px white, 100px pill, max 400px
// Teal dot (8px) for success, Red dot for error. Auto-dismiss 3s.
// Bottom-centre, 24px from bottom.
// Animation: opacity 0→1 + translateY(8px→0) 250ms ease
export function Snackbar({ message, variant, open, onClose }: SnackbarProps) {
  if (!open) return null;
  return <div>{message}</div>;
}
