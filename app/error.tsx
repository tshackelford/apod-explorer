"use client";

import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";

/**
 * Shown when NASA is unreachable and there's no cached page to fall back to.
 * With ISR, a failed background regeneration keeps serving the last good
 * page, so users only see this on a cold cache.
 */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <StatusMessage role="alert" title="Something went wrong" action={<Button onClick={retry}>Try again</Button>}>
      We couldn&apos;t reach NASA&apos;s picture service. Please try again in a moment.
    </StatusMessage>
  );
}
