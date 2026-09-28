import type { ComponentProps } from "react";

type ButtonStyle = {
  /** primary: solid NASA Red call to action. secondary: outlined, lower emphasis. */
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
};

const VARIANTS = {
  primary: "bg-nasa-red-strong font-semibold text-white hover:bg-nasa-red-strong/85",
  secondary:
    "border border-neutral-500 font-medium text-neutral-100 hover:border-nasa-red hover:text-nasa-red",
} as const;

const SIZES = {
  md: "px-4 py-2",
  sm: "px-3 py-1.5 text-sm",
} as const;

/**
 * Button styles as a class string, for elements that must look like a button
 * but aren't one (a link, or the skip link).
 */
export function buttonClasses({ variant = "primary", size = "md" }: ButtonStyle = {}): string {
  return `inline-flex items-center justify-center rounded-md transition-colors ${VARIANTS[variant]} ${SIZES[size]}`;
}

type ButtonProps = ComponentProps<"button"> & ButtonStyle;

/**
 * The app's button. Defaults to `type="button"` so it never submits a form
 * by accident; pass `type="submit"` explicitly when it should.
 * `className` is appended, for layout only (margins, alignment), not colors.
 */
export function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClasses({ variant, size })} ${className}`} {...props} />;
}
