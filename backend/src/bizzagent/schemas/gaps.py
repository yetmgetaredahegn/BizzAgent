from pydantic import BaseModel


class InformationGap(BaseModel):
    field: str
    status: str
    reason: str
    required_evidence: str | None = None
    provider: str | None = None