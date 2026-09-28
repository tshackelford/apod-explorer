import { buttonClasses } from "@/components/ui/Button";

/** First tab stop on every page; lets keyboard users jump past the header. */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={`${buttonClasses()} sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10`}
    >
      Skip to content
    </a>
  );
}
