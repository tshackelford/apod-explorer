"use client";

import { useEffect } from "react";
import { recordVisit, type HistoryEntry } from "@/lib/history";

/**
 * Adds the current APOD to viewing history. Rendering nothing keeps the detail
 * page a server component; only this small piece runs in the browser.
 */
export function RecordVisit({ date, title, imageUrl }: HistoryEntry) {
  useEffect(() => {
    recordVisit({ date, title, imageUrl });
  }, [date, title, imageUrl]);

  return null;
}
