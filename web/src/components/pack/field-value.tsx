import { Check } from "lucide-react";

import type { FieldKind } from "@/lib/form-schema";
import { cn, formatDate, formatETB, formatNumber } from "@/lib/format";
import { parseSdg } from "@/lib/sdg";
import {
  EXPECTED_RESULTS,
  type CompanyOwnership,
  type ExpectedResult,
  type GrowthIndicator,
  type JobPosition,
  type ManagementTeamMember,
  type Milestone,
  type ProductService,
  type RequestedConsultant,
  type RequestedEquipment,
} from "@/lib/types";

function Table({ head, rows, foot }: { head: string[]; rows: (string | number)[][]; foot?: (string | number)[] }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-subtle">
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("py-2 pr-3 font-semibold", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={cn("py-2 pr-3 align-top", i > 0 ? "text-right tabular-nums" : "font-medium text-ink")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {foot && (
          <tfoot>
            <tr className="border-t border-line-strong font-semibold">
              {foot.map((cell, i) => (
                <td key={i} className={cn("py-2 pr-3", i > 0 && "text-right tabular-nums")}>
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

const dash = (value: number | null | undefined) => (value == null ? "—" : formatNumber(value));

export function FieldValue({ kind, value }: { kind: FieldKind; value: unknown }) {
  const empty =
    value == null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0);
  if (empty) {
    return <span className="text-sm text-subtle italic">Not established</span>;
  }

  switch (kind) {
    case "money":
      return <span className="font-semibold text-ink">{formatETB(value as number)}</span>;
    case "percent":
      return <span className="font-semibold text-ink">{value as number}%</span>;
    case "number":
      return <span className="font-semibold text-ink">{formatNumber(value as number)}</span>;
    case "date":
      return <span className="font-semibold text-ink">{formatDate(value as string)}</span>;
    case "text":
      return <span className="font-semibold text-ink">{String(value)}</span>;
    case "longtext":
      return <p className="text-[15px] leading-relaxed text-ink">{String(value)}</p>;

    case "ownership": {
      const o = value as CompanyOwnership;
      const total = o.women_percentage + o.men_percentage;
      return (
        <div className="max-w-sm">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-line">
            <span className="bg-saffron-400" style={{ width: `${(o.women_percentage / Math.max(total, 100)) * 100}%` }} />
            <span className="bg-ink-400" style={{ width: `${(o.men_percentage / Math.max(total, 100)) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-sm">
            <span className="font-semibold">Women {o.women_percentage}%</span>
            <span className="text-subtle"> · </span>
            <span className="font-semibold">Men {o.men_percentage}%</span>
            <span className={cn("ml-2 text-xs", Math.abs(total - 100) > 0.5 ? "font-semibold text-rose-600" : "text-subtle")}>
              total {total}%
            </span>
          </p>
        </div>
      );
    }

    case "growth": {
      const rows = [...(value as GrowthIndicator[])].sort((a, b) => a.year - b.year);
      return (
        <Table
          head={["Year", "Sales (ETB)", "Employees", "Women", "Youth 18–24"]}
          rows={rows.map((r) => [r.year, dash(r.sales_etb), dash(r.total_employees), dash(r.female_employees), dash(r.youth_employees_18_24)])}
        />
      );
    }

    case "team":
      return (
        <Table
          head={["Name", "Position", "Gender"]}
          rows={(value as ManagementTeamMember[]).map((m) => [m.name ?? "—", m.position ?? "—", m.gender ?? "—"])}
        />
      );

    case "equipment": {
      const items = value as RequestedEquipment[];
      const total = items.reduce((sum, e) => sum + (e.estimated_total_price_etb ?? 0), 0);
      return (
        <div className="space-y-3">
          <Table
            head={["Item", "Qty", "Price (ETB)"]}
            rows={items.map((e) => [e.description ?? "—", dash(e.quantity), dash(e.estimated_total_price_etb)])}
            foot={["Total", "", formatNumber(total)]}
          />
          <ul className="space-y-1 text-sm text-muted">
            {items.filter((e) => e.purpose).map((e) => (
              <li key={e.description}>
                <span className="font-medium text-ink">{e.description}:</span> {e.purpose}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "jobs": {
      const jobs = value as JobPosition[];
      const total = jobs.reduce((sum, j) => sum + (j.number_of_new_jobs ?? 0), 0);
      return (
        <Table
          head={["Position", "New jobs"]}
          rows={jobs.map((j) => [j.job_position ?? "—", dash(j.number_of_new_jobs)])}
          foot={["Total", total]}
        />
      );
    }

    case "products":
      return (
        <ul className="grid gap-2 sm:grid-cols-2">
          {(value as ProductService[]).map((p, i) => (
            <li key={i} className="rounded-xl bg-paper p-3 ring-1 ring-line">
              <p className="text-sm font-semibold text-ink">{p.product_service ?? "—"}</p>
              <p className="mt-1 text-xs text-muted">{p.market_served ?? "Market not given"}</p>
              <p className="text-xs text-subtle">{p.distribution_channels ?? "Channel not given"}</p>
            </li>
          ))}
        </ul>
      );

    case "consultants":
      return (
        <ul className="space-y-2">
          {(value as RequestedConsultant[]).map((c, i) => (
            <li key={i} className="rounded-xl bg-paper p-3 text-sm ring-1 ring-line">
              <p className="font-semibold text-ink">{c.technical_expertise_request ?? "—"}</p>
              <p className="mt-1 text-muted">Challenge: {c.problem_challenge_description ?? "—"}</p>
            </li>
          ))}
        </ul>
      );

    case "results": {
      const selected = new Set(value as ExpectedResult[]);
      return (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {Object.values(EXPECTED_RESULTS).map((result) => {
            const on = selected.has(result);
            return (
              <li key={result} className={cn("flex items-center gap-2 text-sm", on ? "font-semibold text-ink" : "text-subtle")}>
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    on ? "border-ink-600 bg-ink-600 text-white" : "border-line-strong bg-surface",
                  )}
                  aria-hidden
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="sr-only">{on ? "Selected: " : "Not selected: "}</span>
                {result}
              </li>
            );
          })}
        </ul>
      );
    }

    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink marker:text-brand-500">
          {(value as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "sdgs":
      return (
        <ul className="flex flex-wrap gap-2">
          {(value as string[]).map((label) => {
            const sdg = parseSdg(label);
            return (
              <li key={label} className="inline-flex items-center gap-2 rounded-lg bg-paper py-1 pr-3 pl-1 text-sm ring-1 ring-line">
                <span
                  className="grid size-7 place-items-center rounded-md text-xs font-bold text-white"
                  style={{ background: sdg?.color ?? "#64748b" }}
                >
                  {sdg?.number ?? "?"}
                </span>
                {sdg?.name ?? label}
              </li>
            );
          })}
        </ul>
      );

    case "milestones":
      return (
        <ol className="space-y-1.5 text-sm">
          {(value as Milestone[]).map((m) => (
            <li key={m.description} className="flex gap-3">
              <span className="w-16 shrink-0 font-semibold text-ink-600">{m.target ?? "—"}</span>
              <span className="text-ink">{m.description}</span>
            </li>
          ))}
        </ol>
      );
  }
}
