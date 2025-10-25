from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_socketio import SocketManager

from app.db import base  # noqa: F401  # Ensure models are imported before metadata creation
from app.db.base_class import Base
from app.db.session import engine

from app.api.routes import admin, ai, auth, clients, interactions, push, reminders, system
from app.core.config import get_settings
from app.services.admin import ensure_default_admin

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_manager = SocketManager(app=app)

app.include_router(system.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(clients.router)
app.include_router(interactions.router)
app.include_router(reminders.router)
app.include_router(ai.router)
app.include_router(push.router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": settings.app_name}


@socket_manager.on("message")
async def handle_message(sid: str, data: dict) -> None:
    await socket_manager.emit("message", data)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_default_admin()
