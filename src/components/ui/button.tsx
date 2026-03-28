import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "hero" | "cta-band";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

// Button — 100px pill radius, PJS 700 15px, active scale(0.97) 80ms
// Primary: Teal 600 bg, white text, hover Teal 800
// Outline: transparent bg, 2px Teal 600 border, hover Teal 50 bg
// Ghost: transparent bg, 2px Slate 200 border, hover Teal 600 border+text
// Danger: Red bg, white text
// Hero: Primary + larger padding (15px 30px), PJS 800 16px
// CTA band: White bg, Teal 800 text
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
