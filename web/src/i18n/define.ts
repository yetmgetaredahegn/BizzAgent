import type { Lang } from "@/lib/types";

/**
 * Declares one area's messages in all three languages. TypeScript makes the
 * Amharic and Afaan Oromo objects match the English keys exactly, so a missing
 * translation fails the build. Amharic and Afaan Oromo text is a DRAFT until a
 * native reviewer signs it off (docs/i18n/translation-workflow.md).
 */
export function defineMessages<K extends string>(messages: Record<Lang, Record<K, string>>) {
  return messages;
}
