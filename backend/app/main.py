import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers.transactions import router as transactions_router
from app.utils.logging import RequestLoggingMiddleware, configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("app")

app = FastAPI(
    title="Mom Money Records API",
    version="1.0.0",
    description="Manual Burmese transaction record API backed by Supabase PostgreSQL.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.info("validation_error path=%s errors=%s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=422,
        content={
            "detail": "ဖြည့်ထားသော အချက်အလက်များကို စစ်ဆေးပါ။",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_error path=%s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "ဆာဗာတွင် အမှားရှိပါသည်။ ခဏနေပြီး ထပ်ကြိုးစားပါ။"},
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "supabase_configured": settings.supabase_configured,
        "frontend_origin": settings.frontend_origin,
    }


app.include_router(transactions_router)
