from pydantic import BaseModel, Field

from bizzagent.schemas.company import ApplicantDescription
from bizzagent.schemas.evidence import Evidence
from bizzagent.schemas.intervention import InterventionRequest


class FileMetadata(BaseModel):
    filename: str
    content_type: str


class UploadedFiles(BaseModel):
    license: FileMetadata
    workshop: FileMetadata


class DocumentCheckResponse(BaseModel):
    """Result of the automated licence/workshop photo check.

    It reports only what was checked. It carries no application data:
    extraction happens in the funding skill, grounded in evidence.
    """

    status: str
    files: UploadedFiles
    checks: dict[str, bool] = Field(default_factory=dict)


class ApplicationData(BaseModel):
    applicant: ApplicantDescription = Field(default_factory=ApplicantDescription)
    intervention: InterventionRequest = Field(default_factory=InterventionRequest)
    evidence: list[Evidence] = Field(default_factory=list)
