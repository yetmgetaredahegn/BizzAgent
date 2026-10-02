from fastapi import APIRouter, File, UploadFile

from bizzagent.schemas import DocumentCheckResponse
from bizzagent.vision.licence_check import check_documents

router = APIRouter(
    prefix="/applications",
    tags=["applications"],
)


@router.post("/process", response_model=DocumentCheckResponse)
async def process_application_route(
    license_image: UploadFile = File(...),
    workshop_image: UploadFile = File(...),
) -> DocumentCheckResponse:
    return await check_documents(license_image=license_image, workshop_image=workshop_image)
