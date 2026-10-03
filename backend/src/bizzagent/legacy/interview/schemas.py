from pydantic import BaseModel, Field

from bizzagent.schemas.application import ApplicationData
from bizzagent.schemas.evidence import TranscriptionResult


class InterviewQuestion(BaseModel):
    field: str
    question: str


class InterviewTurn(BaseModel):
    """One question-answer exchange in the interview."""

    field: str
    question: str
    transcript: str


class InterviewState(BaseModel):
    application: ApplicationData = Field(default_factory=ApplicationData)
    current_question: InterviewQuestion | None = None
    completed_fields: list[str] = Field(default_factory=list)
    audio_url: str | None = None
    history: list[InterviewTurn] = Field(default_factory=list)


class InterviewAnswerResponse(BaseModel):
    state: InterviewState
    transcript: TranscriptionResult
