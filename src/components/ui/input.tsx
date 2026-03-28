import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

// Input — ALWAYS explicit background:#FFFFFF, color:#374151 on the <input> element
// 12px radius, 2px Slate 200 border, Teal 600 on focus, 14px 18px padding
// Focus ring: 4px rgba(0,140,124,0.12) box-shadow
// Label: Inter 600 13px, Slate 800, always above input
// Error: Inter 500 12px, Red. Success: Inter 500 12px, Green
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          ref={ref}
          style={{ backgroundColor: "#FFFFFF", color: "#374151" }}
          {...props}
        />
        {error && <p>{error}</p>}
        {hint && <p>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
