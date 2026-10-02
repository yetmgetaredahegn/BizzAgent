import type { BizzAgentApi } from "./contract";
import { mockClient } from "./mock/client";

/*
 * NEXT_PUBLIC_API_MODE picks the client. Only "mock" exists in the prototype;
 * PR D adds "http" (docs/roadmap.md).
 */
export const api: BizzAgentApi = mockClient;

export type * from "./contract";
