import type { ReactNode } from "react";

/**
 * Responsive card grid: 1 column on phones, 2 on tablets, 3 on desktop.
 * Children should be <li> elements.
 */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  );
}
