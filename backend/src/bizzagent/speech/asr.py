"""Speech-to-text. Local Whisper for development; the model loads on first use."""

from pathlib import Path
from typing import Any

from bizzagent.schemas import TranscriptionResult

MODEL_NAME = "small"

_model: Any = None


def _get_model() -> Any:
    global _model
    if _model is None:
        from faster_whisper import WhisperModel  # heavy import, deferred

        _model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8")
    return _model


def transcribe_audio(audio_path: Path) -> TranscriptionResult:
    segments, info = _get_model().transcribe(str(audio_path), beam_size=5)
    text = " ".join(segment.text.strip() for segment in segments).strip()
    return TranscriptionResult(text=text, language=info.language)
