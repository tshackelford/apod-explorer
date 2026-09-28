import { ViewTransition, type ReactNode } from "react";

/**
 * Directional page slide, driven by the `transitionTypes` on the link that
 * started the navigation: "nav-forward" (list to detail) or "nav-back".
 * Navigations without a type, like the browser back button, swap instantly;
 * the shared image morph still plays for those.
 *
 * This has to wrap each page, not the layout: layouts persist across
 * navigations, so their enter/exit animations would never fire.
 * Animations are defined in globals.css and disabled for reduced motion.
 */
const DIRECTIONAL = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
      {children}
    </ViewTransition>
  );
}
