"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { analyzePack, type PackAnalysis } from "@/lib/analyze";
import { getDemoPack } from "@/lib/fixtures";
import { buildLivePack } from "@/lib/live-pack";
import { declarationStore, liveSessionStore, useStore, type LiveSession } from "@/lib/store";
import type { ApplicationPack, DeclarationId, DeclarationRecord } from "@/lib/types";

interface CaseValue {
  caseId: string;
  pack: ApplicationPack;
  analysis: PackAnalysis;
  session: LiveSession | null;
  declarations: Partial<Record<DeclarationId, DeclarationRecord>>;
  updateDeclaration: (id: DeclarationId, patch: Partial<DeclarationRecord>) => void;
}

const CaseContext = createContext<CaseValue | null>(null);

export function useCasePack(caseId: string): {
  pack: ApplicationPack | null;
  analysis: PackAnalysis | null;
  session: LiveSession | null;
} {
  const session = useStore(liveSessionStore);
  const pack = useMemo(() => {
    if (caseId === "live") return session ? buildLivePack(session) : null;
    return getDemoPack(caseId) ?? null;
  }, [caseId, session]);
  const analysis = useMemo(() => (pack ? analyzePack(pack) : null), [pack]);
  return { pack, analysis, session };
}

export function CaseProvider({
  caseId,
  pack,
  analysis,
  session,
  children,
}: {
  caseId: string;
  pack: ApplicationPack;
  analysis: PackAnalysis;
  session: LiveSession | null;
  children: ReactNode;
}) {
  const book = useStore(declarationStore);
  const declarations = useMemo(() => book[caseId] ?? {}, [book, caseId]);

  const updateDeclaration = useCallback(
    (id: DeclarationId, patch: Partial<DeclarationRecord>) => {
      declarationStore.set((previous) => {
        const current = previous[caseId] ?? {};
        return {
          ...previous,
          [caseId]: { ...current, [id]: { ...(current[id] ?? { id }), ...patch, id } },
        };
      });
    },
    [caseId],
  );

  const value = useMemo(
    () => ({ caseId, pack, analysis, session, declarations, updateDeclaration }),
    [caseId, pack, analysis, session, declarations, updateDeclaration],
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase(): CaseValue {
  const value = useContext(CaseContext);
  if (!value) throw new Error("useCase must be used inside CaseProvider");
  return value;
}
