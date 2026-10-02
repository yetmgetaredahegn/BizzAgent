from pathlib import Path

from faster_whisper import WhisperModel

from bizzagent.schemas import TranscriptionResult


MODEL_NAME = "small"


def transcribe_audio(audio_path: Path) -> TranscriptionResult:
    """
    Transcribe an audio file using a local multilingual Whisper model.
    """
    model = WhisperModel(
        MODEL_NAME,
        device="cpu",
        compute_type="int8",
    )

    segments, info = model.transcribe(
        str(audio_path),
        beam_size=5,
    )

    text = " ".join(
        segment.text.strip()
        for segment in segments
    ).strip()

    return TranscriptionResult(
        text=text,
        language=info.language,
    )