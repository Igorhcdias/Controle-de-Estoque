from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship # <-- Importação nova
from sqlalchemy.sql import func
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255))
    price = Column(Float, nullable=False)
    
    stock_quantity = Column(Integer, default=0) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    movements = relationship("StockMovement", back_populates="product")