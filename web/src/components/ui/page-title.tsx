import type { ReactNode } from "react";

export function PageTitle({ title, lead, children }: { title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
        {lead && <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
