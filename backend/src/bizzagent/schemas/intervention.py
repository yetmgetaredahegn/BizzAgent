from enum import Enum

from pydantic import BaseModel, Field


class ExpectedResult(str, Enum):
    NEW_PRODUCT_SERVICE = "New product/service"

    PRODUCT_SERVICE_DIVERSIFICATION = (
        "Product/service diversification"
    )

    REACHING_NEW_CLIENTS = "Reaching new clients"

    REACHING_NEW_MARKETS = "Reaching new markets"

    ENHANCING_PRODUCTION_CAPACITY = (
        "Enhancing production capacity"
    )

    IMPROVING_PRODUCT_SERVICE_QUALITY = (
        "Improving product/service quality"
    )

    FINANCIAL_SUSTAINABILITY = "Financial sustainability"


class RequestedEquipment(BaseModel):
    description: str | None = None

    quantity: int | None = Field(
        default=None,
        ge=0,
    )

    estimated_total_price_etb: float | None = Field(
        default=None,
        ge=0,
    )

    purpose: str | None = None


class RequestedConsultant(BaseModel):
    problem_challenge_description: str | None = None

    technical_expertise_request: str | None = None


class JobPosition(BaseModel):
    job_position: str | None = None

    number_of_new_jobs: int | None = Field(
        default=None,
        ge=0,
    )


class InterventionRequest(BaseModel):
    problem_description: str | None = None

    equipment: list[RequestedEquipment] = Field(
        default_factory=list
    )

    consultants: list[RequestedConsultant] = Field(
        default_factory=list
    )

    expected_results: list[ExpectedResult] = Field(
        default_factory=list
    )

    expected_results_explanation: str | None = None

    job_creation_explanation: str | None = None

    job_positions: list[JobPosition] = Field(
        default_factory=list
    )

    social_environmental_impact: str | None = None

    osh_commitment: str | None = None