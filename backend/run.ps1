# Quick-start script for the OwnStack FastAPI service.
# Usage:  .\run.ps1
#
# Assumes you have:
#   - Python 3.11+ on PATH
#   - backend/.env populated (copy from backend/.env.example)

$ErrorActionPreference = "Stop"

if (-not (Test-Path .venv)) {
  python -m venv .venv
}

. .\.venv\Scripts\Activate.ps1
pip install --upgrade pip | Out-Null
pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
