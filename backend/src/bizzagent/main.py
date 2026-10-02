import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bizzagent.routes.applications import (
    router as applications_router,
)
from bizzagent.routes.interview import (
    router as interview_router,
)

app = FastAPI(
    title="FundFlow API",
    version="0.1.0",
)

# The Next.js web app (web/) calls the API from the browser.
# Comma-separated list, e.g. "http://localhost:3000,https://fundflow.example".
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(applications_router)
app.include_router(interview_router)
