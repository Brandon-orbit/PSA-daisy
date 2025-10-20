from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Power BI Configuration
    CLIENT_ID: str
    CLIENT_SECRET: str
    TENANT_ID: str
    WORKSPACE_ID: str

    # Azure Storage Configuration
    STORAGE_ACCOUNT_NAME: str
    STORAGE_ACCOUNT_KEY: str
    STORAGE_CONTAINER: str = "powerbi-rag-data"

    # Azure AI Search Configuration
    SEARCH_SERVICE_NAME: str
    SEARCH_ADMIN_KEY: str
    SEARCH_INDEX_NAME: str = "powerbi-rag-index"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
