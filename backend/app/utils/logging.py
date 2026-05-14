import json
import logging
import sys
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(level.upper())


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        started_at = time.perf_counter()
        logger = logging.getLogger("app.request")
        try:
            response = await call_next(request)
        except Exception:
            elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.exception(
                "request_failed path=%s method=%s elapsed_ms=%s",
                request.url.path,
                request.method,
                elapsed_ms,
            )
            raise

        elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.info(
            "request_complete path=%s method=%s status=%s elapsed_ms=%s",
            request.url.path,
            request.method,
            response.status_code,
            elapsed_ms,
        )
        return response
