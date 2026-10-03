"""
Interview service — orchestrates the voice interview flow.

Uses the InterviewAgent to make intelligent decisions about
answer sufficiency and next questions.
"""

import logging

from bizzagent.legacy.interview.agent import ALLOWED_FIELDS, InterviewAgent
from bizzagent.legacy.interview.decision import InterviewDecision
from bizzagent.legacy.interview.schemas import (
    InterviewQuestion,
    InterviewState,
    InterviewTurn,
)
from bizzagent.schemas import Evidence

logger = logging.getLogger(__name__)


# Default questions used for starting the interview and as fallback.
INTERVIEW_QUESTIONS = [
    InterviewQuestion(
        field="company_name",
        question="What is the name of your business?",
    ),
    InterviewQuestion(
        field="type_of_business",
        question="What type of business do you operate?",
    ),
    InterviewQuestion(
        field="description",
        question=("Please briefly describe what your business does."),
    ),
    InterviewQuestion(
        field="address",
        question="Where is your business located?",
    ),
    InterviewQuestion(
        field="number_of_years_in_operation",
        question=("How many years has your business been operating?"),
    ),
    InterviewQuestion(
        field="funding_problem",
        question=("What business problem are you seeking funding to solve?"),
    ),
]


_agent: InterviewAgent | None = None


def _get_agent() -> InterviewAgent:
    """Create the agent on first use so importing the API stays light."""
    global _agent
    if _agent is None:
        _agent = InterviewAgent()
    return _agent


def start_interview() -> InterviewState:
    state = InterviewState()

    state.current_question = INTERVIEW_QUESTIONS[0]

    return state


def get_next_question(
    completed_fields: list[str],
) -> InterviewQuestion | None:
    """Deterministic fallback: pick the first unanswered question."""
    for question in INTERVIEW_QUESTIONS:
        if question.field not in completed_fields:
            return question

    return None


def _compute_gaps(
    state: InterviewState,
) -> list[str]:
    """Return list of field names that are still missing."""
    return [f for f in ALLOWED_FIELDS if f not in state.completed_fields]


def process_interview_answer(
    state: InterviewState,
    transcript: str,
) -> InterviewState:
    """
    Process one interview answer using the interview agent.

    Flow:
    1. Agent evaluates the transcript
    2. Validated field updates are applied
    3. Evidence is recorded
    4. History is appended
    5. Next question is determined
    """
    current_question = state.current_question

    if current_question is None:
        return state

    gaps = _compute_gaps(state)

    # --- Ask the agent ---
    decision: InterviewDecision = _get_agent().decide(
        application=state.application,
        gaps=gaps,
        current_question=current_question,
        transcript=transcript,
        history=state.history,
    )

    logger.info(
        "Agent decision: quality=%s, follow_up=%s, next=%s",
        decision.answer_quality,
        decision.follow_up_required,
        decision.next_field,
    )

    # --- Apply extracted updates ---
    if decision.answer_quality == "sufficient":
        for field, value in decision.extracted_updates.items():
            if value is not None and field in ALLOWED_FIELDS:
                update_application_field(
                    state=state,
                    field=field,
                    value=value,
                )

    # --- Record evidence ---
    state.application.evidence.append(
        Evidence(
            source="voice",
            value={
                "field": current_question.field,
                "transcript": transcript,
                "extracted_updates": decision.extracted_updates,
                "answer_quality": decision.answer_quality,
                "follow_up_required": decision.follow_up_required,
            },
        )
    )

    # --- Append to history ---
    state.history.append(
        InterviewTurn(
            field=current_question.field,
            question=current_question.question,
            transcript=transcript,
        )
    )

    # --- Determine next question ---
    if decision.answer_quality == "sufficient":
        # Mark field as completed.
        if current_question.field not in state.completed_fields:
            state.completed_fields.append(current_question.field)

        # Check if all fields are now complete.
        remaining = [f for f in ALLOWED_FIELDS if f not in state.completed_fields]

        if not remaining:
            # Interview is complete.
            state.current_question = None
        elif (
            decision.next_field is not None
            and decision.next_question is not None
            and decision.next_field in remaining
        ):
            # Use agent's suggestion only if the field
            # is actually still missing.
            state.current_question = InterviewQuestion(
                field=decision.next_field,
                question=decision.next_question,
            )
        else:
            state.current_question = get_next_question(
                completed_fields=state.completed_fields,
            )

    else:
        # Insufficient or unclear — stay on current field
        # or use agent's follow-up.
        if decision.follow_up_required and decision.next_question is not None:
            # Enforce staying on the same field for follow-ups
            follow_up_field = current_question.field

            state.current_question = InterviewQuestion(
                field=follow_up_field,
                question=decision.next_question,
            )
        else:
            # Fallback: re-ask the same question.
            state.current_question = InterviewQuestion(
                field=current_question.field,
                question=current_question.question,
            )

    return state


def update_application_field(
    state: InterviewState,
    field: str,
    value: object,
) -> None:
    company_profile = state.application.applicant.company_profile

    if field == "company_name":
        company_profile.company_name = str(value)

    elif field == "type_of_business":
        company_profile.type_of_business = str(value)

    elif field == "description":
        state.application.applicant.company_overview.description = str(value)

    elif field == "address":
        company_profile.address = str(value)

    elif field == "number_of_years_in_operation":
        try:
            company_profile.number_of_years_in_operation = int(str(value))
        except (ValueError, TypeError):
            pass

    elif field == "funding_problem":
        state.application.intervention.problem_description = str(value)
