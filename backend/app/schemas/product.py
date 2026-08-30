from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    category_id: Optional[int] = None # <-- Adicione esta linha

class ProductResponse(ProductCreate):
    id: int
    stock_quantity: int

    class Config:
        orm_mode = True