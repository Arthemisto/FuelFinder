from pydantic import BaseModel


class FuelTypeResponse(BaseModel):
    id: int
    code: str
    label: str
    is_active: bool

    class Config:
        from_attributes = True