# Language support: Amharic, Afaan Oromo, English

> **What this is:** the language requirements. Choice, switching, turn model, read-back, the language guard, numbers and dates, speech, locale files, fonts, and the test matrix.
> **Who reads it:** everyone touching user-facing text, speech or the concierge.
> **Last reviewed:** 2026-10-02

Requirements: `FR-LNG-*`, `FR-VOX-*`, `NFR-I18N-*`. Related:
[translation workflow](translation-workflow.md) · [glossary](glossary-am-om-en.md) ·
[voice UI](../design/voice-ui.md).

| Code | Language | Script | Status |
|---|---|---|---|
| `en` | English | Latin | reviewed |
| `am` | Amharic (አማርኛ) | Ge'ez (Ethiopic) | **draft: pending native review** |
| `om` | Afaan Oromo (Afaan Oromoo) | Latin (Qubee) | **draft: pending native review** |

## 1. The user chooses, and the choice is interactive

1. **The first screen asks for the language** before anything else. There are three large
   buttons, each with its name in its own script and a **play** button for an audio sample. The
   user can also just say the language name.
2. **Remembered.** The choice is stored in the profile (`("users", id).language`) and used on
   every device and channel.
3. **Switch at any time:**
   - by the language button in the app bar, which is always visible
   - by a spoken intent ("Afaan Oromootiin", "በአማርኛ", "in English")
   - by settings

   On a switch, the **pending question is re-phrased from its locale key and re-spoken**. It is
   never machine-translated on the fly.
4. **Everything the user hears or reads is in their language:**
   - prompts and stage events
   - artifacts
   - errors
   - emails and notifications

   Funder-facing documents use the call's accepted language. The user's original words are kept
   verbatim beside a **labelled** translation.
5. **Code-switching** (for example Amharic with English business words) is accepted in input.
   Output stays in the chosen language, with the glossary term in parentheses where helpful.

## 2. The turn model

Every question offers:

| Option | en | am (draft) | om (draft) |
|---|---|---|---|
| Speak | Speak | ይናገሩ | Dubbadhu |
| Type | Type | ይጻፉ | Barreessi |
| Listen again | Listen again | እንደገና ያዳምጡ | Irra deebi'ii dhaggeeffadhu |
| Explain | What does this mean? | ይህ ምን ማለት ነው? | Kun maal jechuudha? |
| I don't know | I don't know | አላውቅም | Hin beeku |
| Skip | Skip for now | ለአሁን ይዝለሉ | Amma dabarsi |

There is also a **"why we ask"** line under every question.

**Read-back.** Before a value enters an artifact, BizzAgent says what it understood ("You said 8
employees, 6 of them women. Is that right?"). Corrections loop back.

## 3. The language guard (`i18n/language_guard.py`)

- It checks every user-facing model output:
  - **Script:** Ethiopic for `am`, Latin for `om`/`en`.
  - **Language identification:** a lightweight classifier.
  - **Glossary terms:** the required terms are present.
- **On failure:** retry once with a stricter prompt, then fall back to a **reviewed template**
  for that locale key.
- **Legal and declaration text is never generated.** Only reviewed translations from the locale
  files are used (`FR-LNG-005`).

## 4. Numbers, money and dates

- **Number words** in 3 languages, plus Ge'ez numerals (፩ ፪ ፫ … ፲ ፻), parsed by
  `i18n/numbers.py`. "Birr" and "ብር" are recognised as currency.
- **Ambiguous numbers are read back.** "Ten thousand five hundred" → "Br 10,500, correct?"
- **Money display:** "Br 12,500" (en, om), "ብር 12,500" (am), with tabular figures.
- **Ethiopian calendar ↔ Gregorian** (`i18n/ethiopian_calendar.py`).
  - Tested against known pairs, for example **1 Meskerem 2017 EC = 11 September 2024 GC**.
  - Dates are displayed dual: "21 Meskerem 2019 EC · 1 Oct 2026".
  - Spoken dates are read back when the calendar is ambiguous.
  - The Ethiopian fiscal-year convention comes from the country pack, cited.

## 5. Speech

| Language | ASR (dev) | ASR (prod) | TTS (dev) | TTS (prod) |
|---|---|---|---|---|
| en | Whisper | hosted, verified | Kokoro | hosted |
| am | Whisper | hosted where verified, else Whisper | MMS-TTS (spike) | hosted where verified |
| om | MMS (spike) | hosted where verified, else MMS | MMS-TTS (spike) | hosted where verified |

- **No provider is assumed to support am/om** until a spike measures word error rate on recorded
  samples. The results are recorded in this file.
- A **text fallback** is always available.
- WhatsApp/Telegram voice notes (opus) are transcoded before ASR.

## 6. Locale files

- **Location:** `backend/src/bizzagent/i18n/locales/{en,am,om}.json`. The web reads them through
  the API in PR D; until then, `web/src/lib/i18n.ts`.
- **Format:** each key holds `text` plus `reviewed_by` and `reviewed_at`. Draft entries have
  `reviewed_by: null`.

  ```json
  { "decl.onlyYou": { "text": "Only you can tick this box. BizzAgent never ticks it for you.",
                      "reviewed_by": "native-reviewer-id", "reviewed_at": "2026-10-01" } }
  ```

- **CI check:** every key exists in all three files; placeholders match; no empty strings.
- **No hard-coded user-facing strings** in Python or TSX (`NFR-I18N-001`). Lint rules flag string
  literals in JSX text nodes.

## 7. Fonts and layout

- **Noto Sans Ethiopic** for UI text and **Noto Serif Ethiopic** for Amharic display headings.
  `:lang(am)` gets a line height of 1.7.
- **Text-expansion budget:** layouts must tolerate +35% length (Oromo strings are often longer
  than English). Buttons wrap rather than truncate.
- `lang` attributes are set on every mixed-language element so screen readers switch voice.

## 8. Test matrix (`NFR-I18N-002`)

- **Every skill path × {en, am, om}.** First contact, a switch mid-skill, "I don't know", read-back
  correction, and an export in the call's language.
- **Code-switching cases:** am + en business terms, and om + am.
- **Language guard:** a wrong-script output falls back to the template.
- **Number and date parsing:** golden cases per language.
