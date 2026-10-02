from pydantic import BaseModel, Field

from bizzagent.schemas.company import ApplicantDescription
from bizzagent.schemas.evidence import Evidence, TranscriptionResult
from bizzagent.schemas.gaps import InformationGap
from bizzagent.schemas.impact import ImpactProtocolDraft
from bizzagent.schemas.intervention import InterventionRequest


class FileMetadata(BaseModel):
    filename: str
    content_type: str


class ApplicationFiles(BaseModel):
    audio: FileMetadata | None = None
    license: FileMetadata
    workshop: FileMetadata

class ApplicationData(BaseModel):
    applicant: ApplicantDescription = Field(
        default_factory=ApplicantDescription
    )

    intervention: InterventionRequest = Field(
        default_factory=InterventionRequest
    )

    evidence: list[Evidence] = Field(
        default_factory=list
    )


class ApplicationResponse(BaseModel):
    status: str

    application: ApplicationData

    impact_protocol: ImpactProtocolDraft

    transcript: TranscriptionResult | None = None

    files: ApplicationFiles

    gaps: list[InformationGap] = Field(
        default_factory=list
    )