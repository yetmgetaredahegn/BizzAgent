from typing import Any

from pydantic import BaseModel


class Evidence(BaseModel):
    source: str
    value: Any
    confidence: float | None = None


class TranscriptionResult(BaseModel):
    text: str
    language: str | None = None