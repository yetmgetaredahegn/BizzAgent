from pathlib import Path

import soundfile as sf
from kokoro import KPipeline


LANGUAGE_CODE = "a"
VOICE = "af_heart"
SAMPLE_RATE = 24_000

_pipeline = KPipeline(lang_code=LANGUAGE_CODE)


def synthesize_speech(
    text: str,
    output_path: Path,
) -> Path:
    """Generate speech locally with Kokoro."""

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    generator = _pipeline(
        text,
        voice=VOICE,
        speed=1.0,
        split_pattern=r"\n+",
    )

    audio_chunks = []

    for _, _, audio in generator:
        audio_chunks.append(audio)

    if not audio_chunks:
        raise RuntimeError(
            "Kokoro generated no audio."
        )

    import numpy as np

    audio = np.concatenate(audio_chunks)

    sf.write(
        output_path,
        audio,
        SAMPLE_RATE,
    )

    return output_path


def synthesize_question(
    question: str,
    output_directory: Path,
    filename: str,
) -> Path:
    """Generate a question audio file and return its path."""

    return synthesize_speech(
        text=question,
        output_path=output_directory / filename,
    )