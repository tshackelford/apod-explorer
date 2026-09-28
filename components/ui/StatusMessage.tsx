import type { ReactNode } from "react";

type StatusMessageProps = {
  title: string;
  children: ReactNode;
  /** A follow-up action, such as a link home or a retry button. */
  action?: ReactNode;
  /** Set to "alert" for errors so screen readers announce them immediately. */
  role?: "alert";
};

/** Full-page message used by the not-found and error screens. */
export function StatusMessage({ title, children, action, role }: StatusMessageProps) {
  return (
    <div role={role} className="flex max-w-2xl flex-col items-start gap-4">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-neutral-300">{children}</p>
      {action}
    </div>
  );
}
