/**
 * Placeholder shown while a detail page's data loads (only for dates that
 * aren't cached yet). Its shape mirrors ApodDetail, so the real content
 * replaces it without a layout jump.
 */
export function ApodDetailSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6 motion-safe:animate-pulse">
      <span className="sr-only">Loading picture…</span>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className="h-4 w-32 rounded bg-surface-raised" />
        <div className="h-9 w-2/3 rounded bg-surface-raised" />
      </div>
      <div aria-hidden="true" className="aspect-video max-h-[75vh] w-full rounded-xl border border-border bg-surface-raised" />
      <div aria-hidden="true" className="flex flex-col gap-3 lg:w-2/3">
        <div className="h-4 w-full rounded bg-surface-raised" />
        <div className="h-4 w-full rounded bg-surface-raised" />
        <div className="h-4 w-5/6 rounded bg-surface-raised" />
      </div>
    </div>
  );
}
