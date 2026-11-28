FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend:/app/codebase \
    CRAMAI_WEB_DB=/data/cramai_web.db \
    CRAMAI_DOCUMENT_DIR=/data/slides

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY codebase/ ./codebase/
COPY data/ ./data/
COPY frontend/ ./frontend/

RUN adduser --disabled-password --gecos "" --no-create-home appuser \
    && mkdir -p /data/slides \
    && chown -R appuser:appuser /app /data

USER appuser
EXPOSE 8000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=2)"]

CMD ["uvicorn", "app:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--proxy-headers"]
