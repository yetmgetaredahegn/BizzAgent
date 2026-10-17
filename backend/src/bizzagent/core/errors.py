"""Domain exception types and error response formatting."""

from typing import Any

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ApiErrorResponse(BaseModel):
    error: ErrorDetail


class BizzAgentException(HTTPException):
    """Base API exception that adheres to the standard error response shape."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details},
            headers=headers,
        )


class UnauthorizedException(BizzAgentException):
    def __init__(
        self,
        message: str = "Authentication required",
        code: str = "unauthorized",
    ) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=code,
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenActionException(BizzAgentException):
    def __init__(self, message: str = "Action not permitted by your role or capability") -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="forbidden_action",
            message=message,
        )


class NotFoundException(BizzAgentException):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="not_found",
            message=message,
        )


class ConflictException(BizzAgentException):
    def __init__(self, message: str, code: str = "conflict") -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code=code,
            message=message,
        )


def bizzagent_exception_handler(request: Request, exc: BizzAgentException) -> JSONResponse:
    """Format BizzAgent exceptions to standard {error: {code, message, details}} response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
        headers=exc.headers,
    )


def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Format standard HTTP exceptions to standard error shape."""
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        detail = exc.detail
    else:
        code = "unauthorized" if exc.status_code == 401 else "http_error"
        detail = {"code": code, "message": str(exc.detail)}
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail},
        headers=exc.headers,
    )
