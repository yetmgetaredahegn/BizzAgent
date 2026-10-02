from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class BusinessOrganization(str, Enum):
    SOLE_PROPRIETORSHIP = "Sole Proprietorship"
    PRIVATE_LIMITED_COMPANY = "Private Limited Company"
    SHARE_COMPANY = "Share Company"
    OTHER = "Other"


class Gender(str, Enum):
    FEMALE = "Female"
    MALE = "Male"
    OTHER = "Other"
    UNKNOWN = "Unknown"


class CompanyOwnership(BaseModel):
    women_percentage: float = Field(ge=0, le=100)
    men_percentage: float = Field(ge=0, le=100)


class CompanyProfile(BaseModel):
    company_name: str | None = None
    business_registration_number: str | None = None
    address: str | None = None
    mobile_number: str | None = None
    email: EmailStr | None = None
    form_of_business_organization: BusinessOrganization | None = None

    number_of_years_in_operation: int | None = Field(
        default=None,
        ge=0,
    )

    type_of_business: str | None = None
    ownership: CompanyOwnership | None = None


class GrowthIndicator(BaseModel):
    year: int
    sales_etb: float | None = Field(default=None, ge=0)
    total_employees: int | None = Field(default=None, ge=0)
    female_employees: int | None = Field(default=None, ge=0)
    youth_employees_18_24: int | None = Field(
        default=None,
        ge=0,
    )


class CompanyOverview(BaseModel):
    description: str | None = None

    growth_indicators: list[GrowthIndicator] = Field(
        default_factory=list
    )


class ProductService(BaseModel):
    product_service: str | None = None
    market_served: str | None = None
    distribution_channels: str | None = None


class ProductUniqueness(str, Enum):
    NEW_IN_ETHIOPIA = "New product/service in Ethiopia"

    DIFFERENT_FROM_COMPETITORS = (
        "Product/service not new to Ethiopia but "
        "different from competitors"
    )

    NO_UNIQUE_FEATURES = (
        "Product/service with no unique features"
    )


class ManagementTeamMember(BaseModel):
    name: str | None = None
    position: str | None = None
    gender: Gender | None = None


class CompanyManagement(BaseModel):
    core_management_team: list[ManagementTeamMember] = Field(
        default_factory=list
    )

    organogram: str | None = None


class ApplicantDescription(BaseModel):
    company_profile: CompanyProfile = Field(
        default_factory=CompanyProfile
    )

    company_overview: CompanyOverview = Field(
        default_factory=CompanyOverview
    )

    motivation: str | None = None

    business_goals: str | None = None

    market_overview: str | None = None

    products_services: list[ProductService] = Field(
        default_factory=list
    )

    product_uniqueness: ProductUniqueness | None = None

    local_raw_material_percentage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    management: CompanyManagement = Field(
        default_factory=CompanyManagement
    )