from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: str
    quantity: int
    observation: Optional[str] = None

class StockMovementResponse(StockMovementCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True