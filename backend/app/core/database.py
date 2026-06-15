from __future__ import annotations

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import DATABASE_URL

# Engine is created lazily so importing this module without a DATABASE_URL
# doesn't fail at import time. The engine is initialised on first access.
_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(DATABASE_URL, echo=False)
    return _engine


def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _session_factory


# Expose engine as a module-level property for callers that need it directly
# (e.g. the lifespan handler in main.py)
class _EngineProxy:
    def __getattr__(self, name):
        return getattr(get_engine(), name)

    def begin(self):
        return get_engine().begin()


engine = _EngineProxy()


async def get_db() -> AsyncSession:
    async with get_session_factory()() as session:
        yield session
