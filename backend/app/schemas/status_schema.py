from pydantic import BaseModel


class StatusResponse(BaseModel):
    backendStatus: str
    databaseStatus: str
    version: str
    environment: str
    lastPriceUpdate: str | None
    lastImportStatus: str