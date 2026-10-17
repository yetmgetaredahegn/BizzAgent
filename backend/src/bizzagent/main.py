"""BizzAgent application entry point.

Builds the FastAPI ``app`` and mounts module routers as modules are
implemented. No product logic belongs here — only application composition.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from bizzagent.core.config import settings
from bizzagent.core.errors import (
    BizzAgentException,
    bizzagent_exception_handler,
    http_exception_handler,
)
from bizzagent.modules.accounts import accounts_router

app = FastAPI(
    title="BizzAgent API",
    version="0.1.0",
)

# Exception handlers for standard error contract: { error: { code, message, details } }
app.add_exception_handler(BizzAgentException, bizzagent_exception_handler)  # type: ignore[arg-type]
app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore[arg-type]

# The Next.js web app (web/) calls the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Accounts module routes mounted at /v1 (canonical API base) and root
app.include_router(accounts_router, prefix="/v1")
app.include_router(accounts_router)
