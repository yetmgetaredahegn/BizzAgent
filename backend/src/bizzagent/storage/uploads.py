from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import UploadFile


async def save_upload_to_temporary_file(upload_file: UploadFile) -> Path:
    """Persist an upload to a temporary file and return its path.

    Processing services take a path so they stay independent of FastAPI.
    """
    suffix = Path(upload_file.filename or "").suffix
    with NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
        temporary_file.write(await upload_file.read())
        return Path(temporary_file.name)
