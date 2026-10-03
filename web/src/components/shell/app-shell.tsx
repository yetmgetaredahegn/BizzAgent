"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { api, type WorkspaceSummary } from "@/api";
import { useQuery } from "@/api/use-query";
import { LogoMark, Logo } from "@/components/ds/logo";
import { Sheet } from "@/components/ds/sheet";
import { EmptyState, OfflineBanner } from "@/components/ds/states";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";
import { lastWorkspaceStore, useStore } from "@/lib/store";

import { MORE_ICON, VENTURE_NAV, partnerNavFor, type NavItem } from "./nav-config";
import { LanguageMenu, PersonaSwitcher, WorkspaceSwitcher } from "./switchers";
import { WorkspaceProvider } from "./workspace-context";

function homeFor(ws: WorkspaceSummary): string {
  return ws.type === "partner" ? `/p/${ws.id}` : `/w/${ws.id}`;
}

function NavLink({ item, ws, active, badge, layout }: { item: NavItem; ws: string; active: boolean; badge?: number; layout: "bar" | "rail" }) {
  const { t } = useI18n();
  const Icon = item.icon;
  return (
    <Link
      href={item.href(ws)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center justify-center gap-3 text-muted transition-colors hover:text-ink",
        layout === "bar" && "min-h-14 flex-col gap-1 px-1 py-1.5 text-[11px]",
        layout === "rail" && "rounded-sheet min-h-11 flex-col px-2 py-2 text-[11px] laptop:flex-row laptop:justify-start laptop:px-3 laptop:text-[15px]",
        active && "font-semibold text-stamp",
        layout === "rail" && active && "bg-paper",
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden />
        {badge ? (
          <span className="num absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-meskel px-1 text-[10px] leading-4 font-bold text-on-meskel">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={cn(layout === "rail" && "sr-only laptop:not-sr-only", "leading-tight")}>{t(item.label)}</span>
    </Link>
  );
}

export function AppShell({ wsId, kind, children }: { wsId: string | null; kind: "venture" | "partner"; children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const last = useStore(lastWorkspaceStore);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: me, loading } = useQuery("me", () => api.me());

  const candidates = me?.workspaces ?? [];
  const workspace: WorkspaceSummary | undefined =
    candidates.find((w) => w.id === wsId) ??
    (wsId === null ? (candidates.find((w) => w.id === last) ?? candidates[0]) : undefined);

  const inboxKey = workspace?.id ?? "none";
  const { data: inboxCount } = useQuery(`inbox-count:${inboxKey}`, () => (workspace ? api.inboxCount(workspace.id) : Promise.resolve(0)));

  useEffect(() => {
    if (workspace && wsId !== null) lastWorkspaceStore.set(workspace.id);
  }, [workspace, wsId]);

  const nav = kind === "partner" ? partnerNavFor(workspace?.partnerKind) : VENTURE_NAV;

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <LogoMark size={44} className="animate-pulse" />
      </div>
    );
  }

  if (!me || !workspace) {
    const first = candidates[0];
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          art="clip"
          title={t("shell.notFound")}
          action={
            first ? (
              <ButtonLink href={homeFor(first)} onClick={() => router.refresh()}>
                {t("nav.home")}
              </ButtonLink>
            ) : (
              <ButtonLink href="/start">{t("landing.cta.start")}</ButtonLink>
            )
          }
        />
      </div>
    );
  }

  const primary = nav.filter((item) => item.primary);
  const secondary = nav.filter((item) => !item.primary);
  const isActive = (item: NavItem) => (item.match ? item.match(pathname, workspace.id) : pathname === item.href(workspace.id));
  const moreActive = secondary.some(isActive);
  const badge = (item: NavItem) => (item.badge === "inbox" ? (inboxCount ?? 0) : undefined);

  return (
    <WorkspaceProvider value={{ me, workspace }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-stamp focus:px-4 focus:py-2 focus:text-on-stamp">
        {t("nav.skip")}
      </a>
      <div className="min-h-dvh tablet:grid tablet:grid-cols-[4rem_minmax(0,1fr)] laptop:grid-cols-[13.5rem_minmax(0,1fr)]">
        {/* Rail: icons on tablet, full labels from laptop */}
        <aside className="print-hidden sticky top-0 hidden h-dvh flex-col gap-4 border-r border-line bg-surface px-1.5 py-4 tablet:flex laptop:px-3">
          <Link href={homeFor(workspace)} aria-label="BizzAgent" className="mx-auto laptop:mx-0 laptop:px-2">
            <span className="hidden laptop:block">
              <Logo size={30} knock="var(--surface)" />
            </span>
            <span className="laptop:hidden">
              <LogoMark size={32} className="text-stamp" />
            </span>
          </Link>
          <nav aria-label={t("nav.main")} className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {nav.map((item) => (
              <NavLink key={item.id} item={item} ws={workspace.id} active={isActive(item)} badge={badge(item)} layout="rail" />
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="print-hidden sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
            <div className="flex h-14 items-center gap-1 px-2 tablet:px-5 laptop:px-8">
              <Link href={homeFor(workspace)} aria-label="BizzAgent" className="px-1 tablet:hidden">
                <LogoMark size={30} />
              </Link>
              <WorkspaceSwitcher current={workspace} all={me.workspaces} />
              <div className="ml-auto flex shrink-0 items-center">
                <Link
                  href="/me/wallet"
                  className="num min-touch rounded-sheet hidden items-center px-2 text-sm text-muted hover:bg-ink/5 hover:text-ink tablet:flex"
                >
                  {t("shell.credits", { n: me.credits })}
                </Link>
                <LanguageMenu />
                <PersonaSwitcher currentId={me.personaId} />
              </div>
            </div>
            <OfflineBanner />
          </header>

          <main id="main" className="min-w-0 flex-1 pb-24 tablet:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom bar on phones: 5 items + More */}
      <nav
        aria-label={t("nav.main")}
        className="print-hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] tablet:hidden"
      >
        {primary.slice(0, 5).map((item) => (
          <NavLink key={item.id} item={item} ws={workspace.id} active={isActive(item)} badge={badge(item)} layout="bar" />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          className={cn("relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] text-muted", moreActive && "font-semibold text-stamp")}
        >
          <MORE_ICON className="size-5" aria-hidden />
          <span>{t("nav.more")}</span>
        </button>
      </nav>
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t("nav.more")}>
        <ul className="grid grid-cols-3 gap-2">
          {[...primary.slice(5), ...secondary].map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href(workspace.id)}
                  onClick={() => setMoreOpen(false)}
                  className="rounded-sheet flex min-h-20 flex-col items-center justify-center gap-1.5 bg-paper p-2 text-center text-sm font-semibold"
                >
                  <Icon className="size-5 text-stamp" aria-hidden />
                  {t(item.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </WorkspaceProvider>
  );
}
