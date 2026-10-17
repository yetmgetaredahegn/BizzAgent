"""BizzAgent application entry point.

Builds the FastAPI ``app`` and will mount each module's router as modules are
implemented. No product logic belongs here — only application composition.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bizzagent.core.config import settings

app = FastAPI(
    title="BizzAgent API",
    version="0.1.0",
)

# The Next.js web app (web/) calls the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Module routers will be mounted here as modules are implemented.
# Example (when accounts is ready):
#   from bizzagent.modules.accounts import router as accounts_router
#   app.include_router(accounts_router, prefix="/v1")
