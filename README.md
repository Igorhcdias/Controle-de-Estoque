# 📦 Sistema de Controle de Estoque (Fullstack)

Um sistema completo para gerenciamento e controle de estoque, com backend construído em Python (FastAPI) e frontend moderno utilizando React e Vite.

## 🚀 Tecnologias Utilizadas

**Backend:**
* Python 3.10+
* FastAPI (Framework web de alta performance)
* SQLAlchemy & Alembic (ORM e controle de migrações)
* MySQL (Banco de dados relacional)
* Pydantic (Validação de dados)

**Frontend:**
* React
* TypeScript
* Vite (Build tool ultrarrápido)
* Axios (Consumo da API)

---

## 🛠️ Como rodar o projeto localmente

### 1. Pré-requisitos
* Ter o Python, Node.js e o MySQL instalados na máquina.
* Criar um banco de dados vazio no MySQL chamado `estoque_db`:
  ```sql
  CREATE DATABASE estoque_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

### Configurando o backend ###
  # Entre na pasta do backend
cd backend

# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual (Sintaxe para Git Bash no Windows)
source venv/Scripts/activate

# Instale as dependências
pip install -r requirements.txt

### Rodar o backend ###
uvicorn app.main:app --reload

### Configurando o frontend ###

# Entre na pasta do frontend
cd frontend

# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento do Vite
npm run dev