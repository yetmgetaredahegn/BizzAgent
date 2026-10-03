from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bizzagent.config import settings
from bizzagent.legacy.interview.routes import router as legacy_interview_router
from bizzagent.routes.applications import router as applications_router

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


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(applications_router)
app.include_router(legacy_interview_router)
