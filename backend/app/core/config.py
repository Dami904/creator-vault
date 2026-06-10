from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    OPENAI_API_KEY: str = ""
    AI_PROVIDER: str = "openai"

    ESCROW_FACTORY_ADDRESS: str = ""
    REPUTATION_CONTRACT_ADDRESS: str = ""
    USDC_ADDRESS: str = ""
    WEB3_RPC_URL: str = ""

    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
