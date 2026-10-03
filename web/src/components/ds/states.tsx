"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

import { Button } from "../ui/button";
import { EmptyArt, type ArtName } from "./empty-art";

/** EmptyState: a line drawing, one sentence, one primary action. Never a bare "No data". */
export function EmptyState({
  art = "stamp",
  title,
  body,
  action,
  className,
}: {
  art?: ArtName;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-4 py-10 text-center", className)}>
      <EmptyArt name={art} />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {body && <p className="max-w-md text-muted">{body}</p>}
      {action}
    </div>
  );
}

/** StageStatus: a stage-specific line such as "Reading your licence…", never a bare spinner. */
export function StageStatus({ text, className }: { text: string; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("num flex items-center gap-2 text-sm text-muted", className)}>
      <span className="flex h-4 items-end gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-0.5 origin-bottom animate-wave rounded-full bg-stamp"
            style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {text}
    </p>
  );
}

/** ErrorState: what happened, what to do, retry. Technical details stay behind a disclosure. */
export function ErrorState({
  title,
  body,
  onRetry,
  details,
  className,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  details?: string;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div role="alert" className={cn("rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-contradictory", className)}>
      <strong className="text-contradictory">{title ?? t("error.title")}</strong>
      <p className="text-sm">{body ?? t("error.body")}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="w-fit">
          {t("action.retry")}
        </Button>
      )}
      {details && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer">Details</summary>
          <pre className="num mt-1 whitespace-pre-wrap">{details}</pre>
        </details>
      )}
    </div>
  );
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

/** OfflineBanner: shown only while offline; changes are kept locally. */
export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="bg-meskel text-on-meskel flex items-center gap-2 px-4 py-2 text-sm font-semibold">
      <WifiOff className="size-4" aria-hidden /> {t("offline.banner")}
    </div>
  );
}
