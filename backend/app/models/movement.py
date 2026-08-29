from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    movement_type = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)
    observation = Column(String(255))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="movements")