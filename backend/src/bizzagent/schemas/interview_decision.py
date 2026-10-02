from typing import Literal

from pydantic import BaseModel, Field


class InterviewDecision(BaseModel):
    """Structured decision returned by the interview agent."""

    extracted_updates: dict[str, str | int | float | None] = Field(
        default_factory=dict,
        description=(
            "Map of application field name to extracted value."
        ),
    )

    answer_quality: Literal[
        "sufficient",
        "insufficient",
        "unclear",
    ] = "unclear"

    follow_up_required: bool = True

    next_field: str | None = None

    next_question: str | None = None
