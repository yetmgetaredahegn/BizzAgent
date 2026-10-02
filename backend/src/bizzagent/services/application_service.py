from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import HTTPException, UploadFile
from bizzagent.schemas import (
    ApplicantDescription,
    ApplicationData,
    ApplicationFiles,
    ApplicationResponse,
    BusinessOrganization,
    CompanyManagement,
    CompanyOverview,
    CompanyOwnership,
    CompanyProfile,
    Evidence,
    ExpectedResult,
    FileMetadata,
    Gender,
    GrowthIndicator,
    ImpactProtocolDraft,
    InformationGap,
    InterventionRequest,
    JobPosition,
    ManagementTeamMember,
    Milestone,
    ProductService,
    ProductUniqueness,
    RequestedEquipment,
)


async def save_upload_to_temporary_file(
    upload_file: UploadFile,
) -> Path:
    """
    Persist an uploaded file temporarily and return its filesystem path.

    The returned path can be passed to processing services that should
    remain independent from FastAPI's UploadFile abstraction.
    """
    suffix = Path(upload_file.filename or "").suffix

    with NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    ) as temporary_file:
        content = await upload_file.read()
        temporary_file.write(content)

        return Path(temporary_file.name)

import logging
import easyocr

logger = logging.getLogger(__name__)

# Lazy initialization of OCR reader
_ocr_reader = None

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        logger.info("Initializing EasyOCR reader (this may take a minute on first run to download models)...")
        _ocr_reader = easyocr.Reader(['en'], verbose=False)
    return _ocr_reader

async def validate_license_image_ocr(license_image: UploadFile) -> None:
    """Validate that the image contains some business license keywords."""
    await license_image.seek(0)
    img_bytes = await license_image.read()
    await license_image.seek(0)

    try:
        reader = get_ocr_reader()
        # Read text from image bytes
        results = reader.readtext(img_bytes, detail=0)
        text_content = " ".join(results).lower()
        logger.info(f"OCR extracted text: {text_content}")

        # Define keywords that indicate a valid license
        keywords = [
            "license", "licence", "registration", "trade",
            "bureau", "certificate", "ethiopia", "business"
        ]
        
        found = any(keyword in text_content for keyword in keywords)
        
        if not found:
            logger.warning("OCR Validation Failed: No keywords found.")
            raise HTTPException(
                status_code=400,
                detail="The uploaded document does not appear to be a valid business license. Please re-upload.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(
            status_code=400,
            detail="Error scanning the image. Please ensure it is a clear photo of the license.",
        )

async def process_application(
    license_image: UploadFile,
    workshop_image: UploadFile,
) -> ApplicationResponse:
    validate_file_types(
        license_image=license_image,
        workshop_image=workshop_image,
    )
    
    await validate_license_image_ocr(license_image)

    application = build_mock_application()

    files = ApplicationFiles(
        license=FileMetadata(
            filename=license_image.filename or "unknown",
            content_type=license_image.content_type or "unknown",
        ),
        workshop=FileMetadata(
            filename=workshop_image.filename or "unknown",
            content_type=workshop_image.content_type or "unknown",
        ),
    )

    impact_protocol = build_mock_impact_protocol()

    gaps = build_mock_information_gaps()

    return ApplicationResponse(
        status="processed",
        application=application,
        impact_protocol=impact_protocol,
        files=files,
        gaps=gaps,
    )


def build_mock_application() -> ApplicationData:
    return ApplicationData(
        applicant=ApplicantDescription(
            company_profile=CompanyProfile(
                company_name="Mock Spice Processing Enterprise",
                business_registration_number="REG-MOCK-001",
                address="Bekoji, Oromia",
                mobile_number="+251911000000",
                form_of_business_organization=(
                    BusinessOrganization.SOLE_PROPRIETORSHIP
                ),
                number_of_years_in_operation=4,
                type_of_business="Food processing",
                ownership=CompanyOwnership(
                    women_percentage=100,
                    men_percentage=0,
                ),
            ),
            company_overview=CompanyOverview(
                description=(
                    "A small spice processing business producing "
                    "and packaging berbere for local retailers."
                ),
                growth_indicators=[
                    GrowthIndicator(
                        year=2022,
                        sales_etb=300000,
                        total_employees=4,
                        female_employees=3,
                        youth_employees_18_24=1,
                    ),
                    GrowthIndicator(
                        year=2023,
                        sales_etb=420000,
                        total_employees=5,
                        female_employees=4,
                        youth_employees_18_24=1,
                    ),
                    GrowthIndicator(
                        year=2024,
                        sales_etb=600000,
                        total_employees=8,
                        female_employees=6,
                        youth_employees_18_24=2,
                    ),
                ],
            ),
            motivation=(
                "The business wants to improve production capacity "
                "and reach additional markets."
            ),
            business_goals=(
                "Increase production capacity in the short term and "
                "expand distribution to additional towns."
            ),
            market_overview=(
                "The business currently serves local retailers and "
                "plans to expand into regional markets."
            ),
            products_services=[
                ProductService(
                    product_service="Packaged berbere",
                    market_served="Local market",
                    distribution_channels=(
                        "Retail shops and direct sales"
                    ),
                ),
            ],
            product_uniqueness=(
                ProductUniqueness.DIFFERENT_FROM_COMPETITORS
            ),
            local_raw_material_percentage=70,
            management=CompanyManagement(
                core_management_team=[
                    ManagementTeamMember(
                        name="Mock Applicant",
                        position="Owner and Manager",
                        gender=Gender.FEMALE,
                    ),
                ],
            ),
        ),
        intervention=InterventionRequest(
            problem_description=(
                "Current production capacity is limited by "
                "manual processing equipment."
            ),
            equipment=[
                RequestedEquipment(
                    description="Industrial spice grinder",
                    quantity=1,
                    estimated_total_price_etb=450000,
                    purpose=(
                        "Increase processing capacity and "
                        "improve consistency."
                    ),
                ),
            ],
            expected_results=[
                ExpectedResult.ENHANCING_PRODUCTION_CAPACITY,
                ExpectedResult.IMPROVING_PRODUCT_SERVICE_QUALITY,
                ExpectedResult.REACHING_NEW_MARKETS,
            ],
            expected_results_explanation=(
                "New equipment is expected to increase production "
                "capacity, improve consistency, and support "
                "market expansion."
            ),
            job_creation_explanation=(
                "The business expects to hire additional production "
                "and packaging workers as demand increases."
            ),
            job_positions=[
                JobPosition(
                    job_position="Production worker",
                    number_of_new_jobs=3,
                ),
                JobPosition(
                    job_position="Packaging worker",
                    number_of_new_jobs=2,
                ),
            ],
            social_environmental_impact=(
                "The business provides employment opportunities "
                "for local workers, including women."
            ),
            osh_commitment=None,
        ),
        evidence=[
            Evidence(
                source="mock_audio",
                value=(
                    "Mock evidence generated for Milestone 1 "
                    "schema testing."
                ),
            ),
        ],
    )


def build_mock_impact_protocol() -> ImpactProtocolDraft:
    return ImpactProtocolDraft(
        title=(
            "Expanding Local Spice Processing Capacity"
        ),
        location="Bekoji, Oromia",
        sdgs=[
            "SDG 5: Gender Equality",
            "SDG 8: Decent Work and Economic Growth",
        ],
        funding_target_etb=450000,
        beneficiaries=[
            "Business owner",
            "Current employees",
            "New production workers",
        ],
        milestones=[
            Milestone(
                description="Acquire production equipment",
                target="Month 3",
            ),
            Milestone(
                description="Increase production capacity",
                target="Month 6",
            ),
            Milestone(
                description="Create additional jobs",
                target="Month 12",
            ),
        ],
        sector="Food processing",
    )


def build_mock_information_gaps() -> list[InformationGap]:
    return [
        InformationGap(
            field="company_profile.email",
            status="missing",
            reason=(
                "No email address has been established."
            ),
            required_evidence=(
                "Applicant-provided email address."
            ),
            provider="Applicant",
        ),
        InformationGap(
            field="company_management.organogram",
            status="missing",
            reason=(
                "No organizational structure has been provided."
            ),
            required_evidence=(
                "Current company organizational structure."
            ),
            provider="Applicant",
        ),
        InformationGap(
            field="intervention.consultants",
            status="missing",
            reason=(
                "No consultant support request has been established."
            ),
            required_evidence=(
                "Description of the business challenge and "
                "required technical expertise."
            ),
            provider="Applicant",
        ),
        InformationGap(
            field="intervention.osh_commitment",
            status="missing",
            reason=(
                "Occupational safety and health commitment "
                "has not been established."
            ),
            required_evidence=(
                "Applicant explanation of current and planned "
                "OSH practices."
            ),
            provider="Applicant",
        ),
    ]


def validate_file_types(
    license_image: UploadFile,
    workshop_image: UploadFile,
) -> None:
    if (
        not license_image.content_type
        or not license_image.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="license_image must be an image file.",
        )

    if (
        not workshop_image.content_type
        or not workshop_image.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="workshop_image must be an image file.",
        )