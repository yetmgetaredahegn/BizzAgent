import Link from "next/link";

import { Logo } from "@/components/site/brand";

export function SiteFooter() {
  return (
    <footer className="print-hidden mt-auto bg-ink-950 text-white/80">
      <div className="tibeb opacity-90" aria-hidden />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            From a voice note to a fundable proposal. An intake agent between people who talk and
            systems that take structured records, and a reviewer who has to defend a ranking.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-white/50 uppercase">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/apply">Start an application</Link></li>
            <li><Link className="hover:text-white" href="/apply/almaz/pack">Almaz&apos;s demo pack</Link></li>
            <li><Link className="hover:text-white" href="/review">Reviewer dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-white/50 uppercase">Principles</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/#honesty">Evidence over guessing</Link></li>
            <li><Link className="hover:text-white" href="/#declarations">We never tick a declaration</Link></li>
            <li><Link className="hover:text-white" href="/#languages">Amharic · Afaan Oromo · English</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <p>All people and businesses shown are fictional.</p>
          <p>Scoring grid and declaration wording are illustrative until replaced with each funder&apos;s official versions.</p>
        </div>
      </div>
    </footer>
  );
}
