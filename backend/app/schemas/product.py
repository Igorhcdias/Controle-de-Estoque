from pydantic import BaseModel
from typing import Optional

# Schema para quando o usuário for CADASTRAR um produto (não pedimos ID nem data aqui)
class ProductCreate(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float

class ProductResponse(ProductCreate):
    id: int

    class Config:
        orm_mode = True # Diz ao Pydantic para ler os dados do nosso modelo SQLAlchemy