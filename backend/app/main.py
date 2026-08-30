from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.models import product as models
from app.models import movement as movement_models
from app.schemas import product as schemas
from app.schemas import movement as movement_schemas
from app.models import category as category_models
from app.schemas import category as category_schemas

app = FastAPI(title="API Controle de Estoque")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/products/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):

    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(status_code=400, detail="SKU já cadastrado.")
    
    new_product = models.Product(**product.dict())
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product

@app.get("/products/", response_model=List[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.post("/movements/", response_model=movement_schemas.StockMovementResponse)
def create_movement(movement: movement_schemas.StockMovementCreate, db: Session = Depends(get_db)):
    # 1. Verifica se o produto existe no banco
    db_product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    # 2. Valida o tipo de movimentação
    if movement.movement_type not in ["IN", "OUT"]:
        raise HTTPException(status_code=400, detail="Tipo de movimentação inválido. Use 'IN' ou 'OUT'.")
        
    # 3. Calcula o novo saldo (Regra de Negócio)
    if movement.movement_type == "IN":
        db_product.stock_quantity += movement.quantity
    elif movement.movement_type == "OUT":
        # Trava de segurança para não deixar o estoque ficar negativo
        if db_product.stock_quantity < movement.quantity:
            raise HTTPException(status_code=400, detail="Estoque insuficiente para esta saída.")
        db_product.stock_quantity -= movement.quantity
        
    # 4. Prepara o histórico da movimentação
    new_movement = movement_models.StockMovement(**movement.dict())
    db.add(new_movement)
    
    # 5. Salva a movimentação E o novo saldo do produto de uma vez só!
    db.commit()
    db.refresh(new_movement)
    
    return new_movement

    # --- ROTAS DE CATEGORIAS ---

@app.post("/categories/", response_model=category_schemas.CategoryResponse)
def create_category(category: category_schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = category_models.Category(**category.dict())
    db.add(db_category)
    try:
        db.commit()
        db.refresh(db_category)
        return db_category
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao cadastrar. O nome da categoria já existe.")

@app.get("/categories/", response_model=List[category_schemas.CategoryResponse])
def read_categories(db: Session = Depends(get_db)):
    return db.query(category_models.Category).all()

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
        
    db.delete(product)
    db.commit()
    return {"message": "Produto excluído com sucesso."}

@app.put("/products/{product_id}")
def update_product(product_id: int, product_data: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Aqui estou usando o mesmo schema de criação (ProductCreate) pois o frontend envia name, sku e price
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
        
    product.name = product_data.name
    product.sku = product_data.sku
    product.price = product_data.price
    
    db.commit()
    db.refresh(product)
    return product

    from sqlalchemy.exc import IntegrityError

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
        
    try:
        db.delete(category)
        db.commit()
        return {"message": "Categoria excluída com sucesso."}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir esta categoria pois existem produtos vinculados a ela."
        )