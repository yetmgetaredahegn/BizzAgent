"""Document check for uploaded licence and workshop photos.

The OCR model (EasyOCR) loads on first use, so importing this module does
not pull in torch.
"""

import logging
from typing import Any

from fastapi import HTTPException, UploadFile

from bizzagent.schemas.application import DocumentCheckResponse, FileMetadata, UploadedFiles

logger = logging.getLogger(__name__)

LICENCE_KEYWORDS = [
    "license",
    "licence",
    "registration",
    "trade",
    "bureau",
    "certificate",
    "ethiopia",
    "business",
]

_ocr_reader: Any = None


def get_ocr_reader() -> Any:
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr  # heavy import, deferred until a licence is checked

        logger.info("Initialising EasyOCR reader (first run downloads models)")
        _ocr_reader = easyocr.Reader(["en"], verbose=False)
    return _ocr_reader


def validate_file_types(license_image: UploadFile, workshop_image: UploadFile) -> None:
    for name, upload in (("license_image", license_image), ("workshop_image", workshop_image)):
        if not upload.content_type or not upload.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{name} must be an image file.")


async def check_licence_text(license_image: UploadFile) -> None:
    """Reject images that do not look like a business licence."""
    await license_image.seek(0)
    image_bytes = await license_image.read()
    await license_image.seek(0)
    try:
        text = " ".join(get_ocr_reader().readtext(image_bytes, detail=0)).lower()
    except Exception as error:
        logger.error("OCR processing failed: %s", error)
        raise HTTPException(
            status_code=400,
            detail="Error scanning the image. Please make sure it is a clear photo of the licence.",
        ) from error
    if not any(keyword in text for keyword in LICENCE_KEYWORDS):
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded document does not appear to be a valid business licence. "
                "Please re-upload."
            ),
        )


async def check_documents(
    license_image: UploadFile, workshop_image: UploadFile
) -> DocumentCheckResponse:
    validate_file_types(license_image, workshop_image)
    await check_licence_text(license_image)
    return DocumentCheckResponse(
        status="checked",
        files=UploadedFiles(
            license=FileMetadata(
                filename=license_image.filename or "unknown",
                content_type=license_image.content_type or "unknown",
            ),
            workshop=FileMetadata(
                filename=workshop_image.filename or "unknown",
                content_type=workshop_image.content_type or "unknown",
            ),
        ),
        checks={"licence_keywords": True},
    )
