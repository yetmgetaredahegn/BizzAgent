/*
 * Typed client for the existing BizzAgent FastAPI endpoints
 * (backend/src/bizzagent/routes). Base URL from NEXT_PUBLIC_API_BASE_URL.
 */

import type {
  DocumentCheckResponse,
  InterviewAnswerResponse,
  InterviewState,
} from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      `Could not reach the BizzAgent service at ${API_BASE_URL}. Is the backend running?`,
    );
  }

  if (!response.ok) {
    let detail = `The service answered with an error (${response.status}).`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") detail = body.detail;
      else if (body.detail) detail = JSON.stringify(body.detail);
    } catch {
      // Body was not JSON; keep the generic message.
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

/** Validates both photos (the licence is checked with OCR). */
export function processApplication(licence: File, workshop: File): Promise<DocumentCheckResponse> {
  const body = new FormData();
  body.append("license_image", licence);
  body.append("workshop_image", workshop);
  return request("/applications/process", { method: "POST", body });
}

export function startInterview(): Promise<InterviewState> {
  return request("/interview/start", { method: "POST" });
}

export function submitInterviewAnswer(
  state: InterviewState,
  audio: Blob,
  filename: string,
): Promise<InterviewAnswerResponse> {
  const body = new FormData();
  body.append("state", JSON.stringify(state));
  body.append("audio_file", audio, filename);
  return request("/interview/answer", { method: "POST", body });
}

/**
 * The backend writes follow-up questions for the same field to the same
 * file, so a version parameter stops the browser replaying a cached answer.
 */
export function questionAudioUrl(path: string | null, version: number): string | null {
  if (!path) return null;
  const absolute = /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
  return `${absolute}${absolute.includes("?") ? "&" : "?"}v=${version}`;
}
