export const SECTIONS = ["language", "memory", "autonomy", "instructions", "connectors", "notifications"] as const;

export type Section = (typeof SECTIONS)[number];
