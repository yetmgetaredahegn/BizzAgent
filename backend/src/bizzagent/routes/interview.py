from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse

from bizzagent.schemas import (
    InterviewAnswerResponse,
    InterviewState,
)
from bizzagent.services.application_service import (
    save_upload_to_temporary_file,
)
from bizzagent.services.interview_service import (
    process_interview_answer,
    start_interview,
)
from bizzagent.services.transcription_service import (
    transcribe_audio,
)
from bizzagent.services.tts_service import (
    synthesize_speech,
)


router = APIRouter(
    prefix="/interview",
    tags=["interview"],
)


GENERATED_AUDIO_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "generated_audio"
)


def generate_question_audio(
    state: InterviewState,
) -> InterviewState:
    if state.current_question is None:
        state.audio_url = None
        return state

    field = state.current_question.field

    output_path = (
        GENERATED_AUDIO_DIR
        / f"{field}.wav"
    )

    synthesize_speech(
        state.current_question.question,
        output_path,
    )

    state.audio_url = (
        f"/interview/question-audio/{field}"
    )

    return state


@router.get(
    "/question-audio/{field}",
)
async def get_question_audio(
    field: str,
):
    audio_path = (
        GENERATED_AUDIO_DIR
        / f"{field}.wav"
    )

    if not audio_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Question audio not found.",
        )

    return FileResponse(
        audio_path,
        media_type="audio/wav",
    )


@router.post(
    "/start",
    response_model=InterviewState,
)
async def start_interview_route() -> InterviewState:
    state = start_interview()

    return generate_question_audio(state)


@router.post(
    "/answer",
    response_model=InterviewAnswerResponse,
)
async def answer_interview_question(
    state: str = Form(...),
    audio_file: UploadFile = File(...),
) -> InterviewAnswerResponse:
    try:
        interview_state = InterviewState.model_validate_json(
            state
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interview state: {error}",
        ) from error

    if (
        not audio_file.content_type
        or not audio_file.content_type.startswith("audio/")
    ):
        raise HTTPException(
            status_code=400,
            detail="audio_file must be an audio file.",
        )

    temporary_path: Path | None = None

    try:
        temporary_path = await save_upload_to_temporary_file(
            audio_file
        )

        transcript = transcribe_audio(
            temporary_path
        )

        updated_state = process_interview_answer(
            state=interview_state,
            transcript=transcript.text,
        )

        updated_state = generate_question_audio(
            updated_state
        )

        return InterviewAnswerResponse(
            state=updated_state,
            transcript=transcript,
        )

    finally:
        if (
            temporary_path is not None
            and temporary_path.exists()
        ):
            temporary_path.unlink()