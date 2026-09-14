from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: str
    quantity: int = Field(gt=0)
    observation: Optional[str] = None


class StockMovementResponse(StockMovementCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True