import {
  Activity,
  Briefcase,
  CircleEllipsis,
  FileText,
  FolderOpen,
  Gauge,
  Home,
  Inbox,
  ListChecks,
  MessageCircle,
  Search,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { MessageId } from "@/i18n";

export interface NavItem {
  id: string;
  label: MessageId;
  href: (ws: string) => string;
  icon: LucideIcon;
  /** Shown in the phone's bottom bar (the rest go under More). */
  primary?: boolean;
  badge?: "inbox";
  match?: (path: string, ws: string) => boolean;
}

const start = (prefix: string) => (path: string, ws: string) => path.startsWith(prefix.replace("{ws}", ws));

export const VENTURE_NAV: NavItem[] = [
  { id: "home", label: "nav.home", href: (ws) => `/w/${ws}`, icon: Home, primary: true, match: (p, ws) => p === `/w/${ws}` },
  { id: "talk", label: "nav.talk", href: (ws) => `/w/${ws}/talk`, icon: MessageCircle, primary: true, match: start("/w/{ws}/talk") },
  { id: "inbox", label: "nav.inbox", href: (ws) => `/w/${ws}/inbox`, icon: Inbox, primary: true, badge: "inbox", match: start("/w/{ws}/inbox") },
  { id: "missions", label: "nav.missions", href: (ws) => `/w/${ws}/missions`, icon: ListChecks, match: start("/w/{ws}/missions") },
  { id: "file", label: "nav.file", href: (ws) => `/w/${ws}/file`, icon: FolderOpen, primary: true, match: start("/w/{ws}/file") },
  { id: "funding", label: "nav.funding", href: (ws) => `/w/${ws}/opportunities`, icon: Search, primary: true, match: (p, ws) => ["opportunities", "common-application", "funding", "readiness", "passport"].some((s) => p.startsWith(`/w/${ws}/${s}`)) },
  { id: "money", label: "nav.money", href: (ws) => `/w/${ws}/money`, icon: Gauge, match: start("/w/{ws}/money") },
  { id: "team", label: "nav.team", href: (ws) => `/w/${ws}/team`, icon: Users, match: start("/w/{ws}/team") },
  { id: "documents", label: "nav.documents", href: (ws) => `/w/${ws}/documents`, icon: FileText, match: start("/w/{ws}/documents") },
  { id: "wallet", label: "nav.wallet", href: () => `/me/wallet`, icon: Wallet, match: (p) => p.startsWith("/me/wallet") },
  { id: "activity", label: "nav.activity", href: (ws) => `/w/${ws}/activity`, icon: Activity, match: start("/w/{ws}/activity") },
  { id: "settings", label: "nav.settings", href: () => `/me/settings`, icon: Settings, match: (p) => p.startsWith("/me/settings") },
];

export const PARTNER_NAV: NavItem[] = [
  { id: "overview", label: "nav.overview", href: (org) => `/p/${org}`, icon: Home, primary: true, match: (p, org) => p === `/p/${org}` },
  { id: "calls", label: "nav.calls", href: (org) => `/p/${org}/calls`, icon: Briefcase, primary: true, match: start("/p/{ws}/calls") },
  { id: "review", label: "nav.review", href: (org) => `/p/${org}/review`, icon: ListChecks, primary: true, match: start("/p/{ws}/review") },
  { id: "ventures", label: "nav.ventures", href: (org) => `/p/${org}/ventures`, icon: FolderOpen, primary: true, match: start("/p/{ws}/ventures") },
  { id: "members", label: "nav.members", href: (org) => `/p/${org}/members`, icon: Users, primary: true, match: start("/p/{ws}/members") },
  { id: "wallet", label: "nav.wallet", href: () => `/me/wallet`, icon: Wallet, match: (p) => p.startsWith("/me/wallet") },
  { id: "settings", label: "nav.settings", href: () => `/me/settings`, icon: Settings, match: (p) => p.startsWith("/me/settings") },
];

/** The partner menu depends on what the organisation does: funders review, programmes see ventures, advisors coach. */
export function partnerNavFor(kind: "funder" | "program" | "support_org" | undefined): NavItem[] {
  const drop: Record<string, string[]> = { funder: ["ventures"], program: ["review"], support_org: ["calls", "review"] };
  const hidden = kind ? (drop[kind] ?? []) : [];
  return PARTNER_NAV.filter((item) => !hidden.includes(item.id));
}

export const MORE_ICON = CircleEllipsis;
