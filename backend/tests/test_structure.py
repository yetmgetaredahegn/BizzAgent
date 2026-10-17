"""Structural smoke tests for the backend package."""

import subprocess
import sys


def test_importing_the_app_loads_no_heavy_models() -> None:
    """Guard: importing bizzagent.main must not pull in heavy libraries."""
    code = (
        "import sys, bizzagent.main\n"
        "heavy = {'torch', 'easyocr', 'kokoro', 'faster_whisper', 'langchain_ollama'}\n"
        "print(sorted(heavy & set(sys.modules)))"
    )
    result = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, check=True
    )
    assert result.stdout.strip() == "[]"


def test_package_structure_has_required_layers() -> None:
    """Guard: the four structural layers exist as importable packages."""
    import bizzagent.core
    import bizzagent.integrations
    import bizzagent.modules
    import bizzagent.shared

    assert bizzagent.core.__doc__ is not None
    assert bizzagent.integrations.__doc__ is not None
    assert bizzagent.modules.__doc__ is not None
    assert bizzagent.shared.__doc__ is not None
