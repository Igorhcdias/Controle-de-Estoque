from datetime import timedelta
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core import security
from app.core.auth import get_current_user
from app.core.database import SessionLocal
from app.models import category as category_models
from app.models import movement as movement_models
from app.models import product as models
from app.models import user as user_models
from app.schemas import category as category_schemas
from app.schemas import movement as movement_schemas
from app.schemas import product as schemas
from app.schemas import user as user_schemas


app = FastAPI(title="API Controle de Estoque")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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


# --- ROTAS DE AUTENTICAÇÃO ---


@app.post("/users/", response_model=user_schemas.UserResponse)
def create_user(
    user: user_schemas.UserCreate,
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(user_models.User)
        .filter(user_models.User.username == user.username)
        .first()
    )

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Nome de usuário já registrado",
        )

    db_email = (
        db.query(user_models.User)
        .filter(user_models.User.email == user.email)
        .first()
    )

    if db_email:
        raise HTTPException(
            status_code=400,
            detail="E-mail já registrado",
        )

    hashed_password = security.get_password_hash(user.password)

    new_user = user_models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/token", response_model=user_schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(user_models.User)
        .filter(user_models.User.username == form_data.username)
        .first()
    )

    if not user or not security.verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = security.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# --- ROTAS DE PRODUTOS ---


@app.post("/products/", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    db_product = (
        db.query(models.Product)
        .filter(models.Product.sku == product.sku)
        .first()
    )

    if db_product:
        raise HTTPException(
            status_code=400,
            detail="SKU já cadastrado.",
        )

    new_product = models.Product(**product.dict())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@app.get("/products/", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    products = (
        db.query(models.Product)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return products


@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado.",
        )

    product.name = product_data.name
    product.sku = product_data.sku
    product.price = product_data.price
    product.category_id = product_data.category_id

    db.commit()
    db.refresh(product)

    return product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado.",
        )

    db.delete(product)
    db.commit()

    return {"message": "Produto excluído com sucesso."}


# --- ROTAS DE MOVIMENTAÇÕES ---


@app.post(
    "/movements/",
    response_model=movement_schemas.StockMovementResponse,
)
def create_movement(
    movement: movement_schemas.StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    # 1. Verifica se o produto existe.
    db_product = (
        db.query(models.Product)
        .filter(models.Product.id == movement.product_id)
        .first()
    )

    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado.",
        )

    # 2. Valida o tipo de movimentação.
    if movement.movement_type not in ["IN", "OUT"]:
        raise HTTPException(
            status_code=400,
            detail="Tipo de movimentação inválido. Use 'IN' ou 'OUT'.",
        )

    # 3. Calcula o novo saldo.
    if movement.movement_type == "IN":
        db_product.stock_quantity += movement.quantity

    elif movement.movement_type == "OUT":
        if db_product.stock_quantity < movement.quantity:
            raise HTTPException(
                status_code=400,
                detail="Estoque insuficiente para esta saída.",
            )

        db_product.stock_quantity -= movement.quantity

    # 4. Prepara o histórico da movimentação.
    new_movement = movement_models.StockMovement(**movement.dict())
    db.add(new_movement)

    # 5. Salva a movimentação e o novo saldo na mesma transação.
    db.commit()
    db.refresh(new_movement)

    return new_movement

@app.get(
    "/movements/",
    response_model=List[movement_schemas.StockMovementResponse],
)
def read_movements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    movements = (
        db.query(movement_models.StockMovement)
        .order_by(movement_models.StockMovement.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return movements
    
# --- ROTAS DE CATEGORIAS ---


@app.post("/categories/", response_model=category_schemas.CategoryResponse)
def create_category(
    category: category_schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    db_category = category_models.Category(**category.dict())
    db.add(db_category)

    try:
        db.commit()
        db.refresh(db_category)
        return db_category

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Erro ao cadastrar. O nome da categoria já existe.",
        )


@app.get(
    "/categories/",
    response_model=List[category_schemas.CategoryResponse],
)
def read_categories(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    return db.query(category_models.Category).all()


@app.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    category = (
        db.query(category_models.Category)
        .filter(category_models.Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada.",
        )

    try:
        db.delete(category)
        db.commit()

        return {"message": "Categoria excluída com sucesso."}

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=(
                "Não é possível excluir esta categoria pois "
                "existem produtos vinculados a ela."
            ),
        )