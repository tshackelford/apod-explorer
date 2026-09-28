import Link from "next/link";
import type { ComponentProps } from "react";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Open in a new tab, with safe `rel` and a screen-reader hint. */
  newTab?: boolean;
};

/**
 * The app's inline link style (NASA Red, underlined). Uses next/link for
 * both internal and external URLs; external ones are rendered as plain
 * anchors. `className` is appended, for layout only, not colors.
 */
export function TextLink({ newTab = false, className = "", children, ...props }: TextLinkProps) {
  return (
    <Link
      className={`text-nasa-red underline underline-offset-4 transition-colors hover:text-white ${className}`}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    >
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </Link>
  );
}
