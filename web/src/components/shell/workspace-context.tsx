"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Me, WorkspaceSummary } from "@/api";

interface WorkspaceValue {
  me: Me;
  workspace: WorkspaceSummary;
}

const Ctx = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ value, children }: { value: WorkspaceValue; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The signed-in persona and the workspace the current screen belongs to. */
export function useWorkspace(): WorkspaceValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useWorkspace must be used inside the app shell");
  return value;
}
