import subprocess
import sys

from fastapi.testclient import TestClient

from bizzagent.main import app

client = TestClient(app)


def test_health() -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_document_check_rejects_non_images() -> None:
    response = client.post(
        "/applications/process",
        files={
            "license_image": ("licence.txt", b"not an image", "text/plain"),
            "workshop_image": ("workshop.jpg", b"\xff\xd8", "image/jpeg"),
        },
    )
    assert response.status_code == 400
    assert "license_image" in response.json()["detail"]


def test_importing_the_api_loads_no_heavy_models() -> None:
    code = (
        "import sys, bizzagent.main\n"
        "heavy = {'torch', 'easyocr', 'kokoro', 'faster_whisper', 'langchain_ollama'}\n"
        "print(sorted(heavy & set(sys.modules)))"
    )
    result = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, check=True
    )
    assert result.stdout.strip() == "[]"
