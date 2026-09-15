"""Runtime configuration.

Secrets are read from the environment or a local `.env` file (gitignored),
never written in code. See `.env.example` for the available settings.
"""
import os
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file(BASE_DIR / ".env")

# With no configured key a random one is generated per process, so the signing
# secret never lives in the repository. Set SECRET_KEY to keep tokens valid
# across restarts.
SECRET_KEY = os.environ.get("SECRET_KEY") or secrets.token_urlsafe(32)

# Demo account seeded on first start; override both in production.
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

MODEL_PATH = BASE_DIR / "app" / "model" / "demand_model.joblib"
