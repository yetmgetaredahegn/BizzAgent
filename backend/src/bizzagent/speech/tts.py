"""Text-to-speech. Local Kokoro (English) for development; loads on first use."""

from pathlib import Path
from typing import Any

LANGUAGE_CODE = "a"
VOICE = "af_heart"
SAMPLE_RATE = 24_000

_pipeline: Any = None


def _get_pipeline() -> Any:
    global _pipeline
    if _pipeline is None:
        from kokoro import KPipeline  # heavy import, deferred

        _pipeline = KPipeline(lang_code=LANGUAGE_CODE)
    return _pipeline


def synthesize_speech(text: str, output_path: Path) -> Path:
    import numpy as np
    import soundfile as sf

    output_path.parent.mkdir(parents=True, exist_ok=True)
    chunks = [
        audio for _, _, audio in _get_pipeline()(text, voice=VOICE, speed=1.0, split_pattern=r"\n+")
    ]
    if not chunks:
        raise RuntimeError("Kokoro generated no audio.")
    sf.write(output_path, np.concatenate(chunks), SAMPLE_RATE)
    return output_path
