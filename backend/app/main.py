from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, profiles, deals, wallet, reputation
from app.core.config import settings

app = FastAPI(title="CreatorVault API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/api/profile", tags=["profiles"])
app.include_router(deals.router, prefix="/api", tags=["deals"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(reputation.router, prefix="/api/reputation", tags=["reputation"])


@app.get("/health")
async def health():
    return {"status": "ok"}
