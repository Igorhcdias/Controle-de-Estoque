from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)


    category = relationship("Category", back_populates="products")
    movements = relationship("StockMovement", back_populates="product")