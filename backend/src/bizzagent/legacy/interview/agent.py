"""
Interview agent — uses LangChain + Ollama to make structured
interview decisions for the legacy funding-application interview.

This is NOT a chatbot.  The agent exists for one job:
complete the structured funding application by asking the
minimum useful questions.
"""

import json
import logging

from bizzagent.legacy.interview.decision import InterviewDecision
from bizzagent.legacy.interview.schemas import InterviewQuestion, InterviewTurn
from bizzagent.schemas.application import ApplicationData

logger = logging.getLogger(__name__)


MODEL_NAME = "llama3.1:8b"

# The fields the interview is allowed to collect.
ALLOWED_FIELDS: list[str] = [
    "company_name",
    "type_of_business",
    "description",
    "address",
    "number_of_years_in_operation",
    "funding_problem",
]

# Human-readable labels for each field (used in the prompt).
FIELD_LABELS: dict[str, str] = {
    "company_name": "Full registered business name",
    "type_of_business": "Type of business (e.g. manufacturing, trade, service)",
    "description": "Brief description of what the business does",
    "address": "Business address / location",
    "number_of_years_in_operation": "Number of years in operation (integer)",
    "funding_problem": "The business problem the applicant seeks funding to solve",
}


def _get_field_values(application: ApplicationData) -> dict[str, str | None]:
    """Extract current known values for each allowed field."""
    cp = application.applicant.company_profile
    co = application.applicant.company_overview
    iv = application.intervention

    return {
        "company_name": cp.company_name,
        "type_of_business": cp.type_of_business,
        "description": co.description,
        "address": cp.address,
        "number_of_years_in_operation": (
            str(cp.number_of_years_in_operation)
            if cp.number_of_years_in_operation is not None
            else None
        ),
        "funding_problem": iv.problem_description,
    }


def _build_prompt(
    application: ApplicationData,
    gaps: list[str],
    current_question: InterviewQuestion,
    transcript: str,
    history: list[InterviewTurn],
) -> str:
    """Build the full prompt for the interview agent."""

    field_values = _get_field_values(application)

    known_section = (
        "\n".join(
            f"  - {FIELD_LABELS.get(f, f)}: {v}" for f, v in field_values.items() if v is not None
        )
        or "  (none yet)"
    )

    gaps_section = (
        "\n".join(f"  - {FIELD_LABELS.get(f, f)}" for f in gaps)
        or "  (none — interview may be complete)"
    )

    history_section = ""
    if history:
        turns = []
        for turn in history[-6:]:  # last 6 turns max
            turns.append(f"  Q [{turn.field}]: {turn.question}\n  A: {turn.transcript}")
        history_section = "Recent interview history:\n" + "\n\n".join(turns)

    allowed_fields_list = "\n".join(f"  - {f}: {FIELD_LABELS.get(f, f)}" for f in ALLOWED_FIELDS)

    return f"""You are an interview agent for a funding application system.

Your ONE job: evaluate the applicant's answer and decide what to do next.

ALLOWED APPLICATION FIELDS:
{allowed_fields_list}

INFORMATION ALREADY COLLECTED:
{known_section}

INFORMATION STILL MISSING:
{gaps_section}

{history_section}

CURRENT QUESTION:
Field: {current_question.field}
Question: "{current_question.question}"

APPLICANT'S ANSWER (transcribed from audio):
"{transcript}"

INSTRUCTIONS:
1. Extract any information relevant to the current field from the transcript.
2. Evaluate whether the answer is SUFFICIENT to fill the field properly.
   - A partial name like "Abebe" is INSUFFICIENT for a full business name.
   - A vague answer like "we do stuff" is INSUFFICIENT for a description.
   - A clear, complete answer is SUFFICIENT.
3. If the answer is insufficient or unclear, set follow_up_required to true
   and generate a follow-up question that explicitly states what the user just said, explains why it is confusing or insufficient, and asks for the specific missing detail.
   - You MUST put this follow-up question in the `next_question` JSON field.
   - You MUST set `next_field` to the exact same field as the CURRENT field. Do not advance to a new field.
   - Example for company_name: "You mentioned 'Abebe', but that sounds like a personal name rather than a registered PLC or business name. Could you please provide the full legal name of your business?"
   - Example for description: "You mentioned 'we sell stuff', but I need to know the specific type of products or industry you are in. Could you clarify what exactly you sell?"
4. If the answer is sufficient, choose the next MISSING field and write a
   natural question for it, and put it in the `next_question` field.
5. If ALL fields are filled, set next_field and next_question to null.

Return ONLY valid JSON with this exact structure:

{{
    "extracted_updates": {{
        "{current_question.field}": "<extracted value or null>"
    }},
    "answer_quality": "sufficient" | "insufficient" | "unclear",
    "follow_up_required": true | false,
    "next_field": "<field name or null>",
    "next_question": "<natural question text or null>"
}}

Rules:
- Do NOT invent or assume information not in the transcript.
- Do NOT extract information for fields other than the current one.
- extracted_updates keys MUST be from the allowed fields list.
- next_field MUST be from the allowed fields list or null.
- Do NOT include markdown formatting, code fences, or explanations.
- Return ONLY the JSON object.
"""


class InterviewAgent:
    """Thin wrapper around Ollama for structured interview decisions."""

    def __init__(
        self,
        model_name: str = MODEL_NAME,
    ):
        # Deferred so the API imports without the llm-local extra installed.
        from langchain_ollama import ChatOllama

        self._llm = ChatOllama(
            model=model_name,
            temperature=0,
        )

    def decide(
        self,
        application: ApplicationData,
        gaps: list[str],
        current_question: InterviewQuestion,
        transcript: str,
        history: list[InterviewTurn] | None = None,
    ) -> InterviewDecision:
        """
        Evaluate the applicant's answer and return a structured
        decision about what to do next.
        """
        if history is None:
            history = []

        prompt = _build_prompt(
            application=application,
            gaps=gaps,
            current_question=current_question,
            transcript=transcript,
            history=history,
        )

        try:
            response = self._llm.invoke(prompt)
            raw = str(response.content).strip()

            # Strip markdown code fences if the model wraps output.
            if raw.startswith("```"):
                lines = raw.split("\n")
                lines = [line for line in lines if not line.strip().startswith("```")]
                raw = "\n".join(lines)

            parsed = json.loads(raw)
            decision = InterviewDecision.model_validate(parsed)

            # Safety: reject any extracted keys not in ALLOWED_FIELDS.
            decision.extracted_updates = {
                k: v for k, v in decision.extracted_updates.items() if k in ALLOWED_FIELDS
            }

            # Safety: reject next_field if not in ALLOWED_FIELDS.
            if decision.next_field is not None and decision.next_field not in ALLOWED_FIELDS:
                decision.next_field = None
                decision.next_question = None

            return decision

        except Exception as exc:
            logger.warning(
                "Interview agent failed: %s. Returning safe fallback decision.",
                exc,
            )

            # Safe fallback: stay on current field, ask again.
            return InterviewDecision(
                extracted_updates={},
                answer_quality="unclear",
                follow_up_required=True,
                next_field=current_question.field,
                next_question=(
                    f"I didn't quite catch that. "
                    f"Could you please answer again: "
                    f"{current_question.question}"
                ),
            )
