from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.core.database import engine, get_session_factory
from app.models import Base
from app.models.user import User
from app.routers import health as health_router
from app.routers import jobs as jobs_router
from app.routers import profile as profile_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path("uploads").mkdir(exist_ok=True)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with get_session_factory()() as session:
            result = await session.execute(select(User).where(User.id == 1))
            if result.scalar_one_or_none() is None:
                session.add(User(id=1))
                await session.commit()
    except Exception:
        # DB may be unreachable at startup. App still starts; /health/db reports live status.
        pass
    yield


app = FastAPI(title="JobSense AI", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router.router)
app.include_router(jobs_router.router, prefix="/api")
app.include_router(profile_router.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
