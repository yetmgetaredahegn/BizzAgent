from pydantic import BaseModel, Field


class Milestone(BaseModel):
    description: str
    target: str | None = None


class ImpactProtocolDraft(BaseModel):
    title: str | None = None
    location: str | None = None
    sdgs: list[str] = Field(default_factory=list)
    funding_target_etb: float | None = None
    beneficiaries: list[str] = Field(default_factory=list)
    milestones: list[Milestone] = Field(default_factory=list)
    sector: str | None = None