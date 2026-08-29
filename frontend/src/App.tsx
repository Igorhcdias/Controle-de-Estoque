import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');

  const fetchProducts = () => {
    axios.get('http://127.0.0.1:8000/products/')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Erro ao buscar produtos:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/products/', {
        name: name,
        sku: sku,
        price: parseFloat(price)
      });
      setName('');
      setSku('');
      setPrice('');
      fetchProducts();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar. Verifique se o SKU já existe.");
    }
  };

  // NOVA FUNÇÃO: Integração com a API de Movimentação de Estoque
  const handleMovement = async (productId: number, type: 'IN' | 'OUT') => {
    const actionName = type === 'IN' ? 'ENTRADA' : 'SAÍDA';
    const quantityStr = prompt(`Digite a quantidade para registrar a ${actionName}:`);
    
    if (!quantityStr) return; // Cancela se o usuário fechar o prompt

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Por favor, digite um número válido maior que zero.");
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/movements/', {
        product_id: productId,
        movement_type: type,
        quantity: quantity,
        observation: `Movimentação via painel web`
      });
      
      // Recarrega a tabela para mostrar o novo saldo atualizado
      fetchProducts();
    } catch (error: any) {
      console.error("Erro ao movimentar estoque:", error);
      // Pega a mensagem de erro que mandamos do backend (ex: Estoque insuficiente)
      const errorMsg = error.response?.data?.detail || "Erro ao movimentar estoque.";
      alert(errorMsg);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>📦 Controle de Estoque</h1>

      <div style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Cadastrar Novo Produto</h3>
        <form onSubmit={handleCreateProduct} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Nome</label>
            <input required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>SKU</label>
            <input required value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Preço (R$)</label>
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <button type="submit" style={{ padding: '4px 15px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>Salvar</button>
        </form>
      </div>
      
      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ backgroundColor: '#eaeaea', textAlign: 'left' }}>
          <tr>
            <th>ID</th>
            <th>Produto</th>
            <th>SKU</th>
            <th>Preço</th>
            <th>Saldo</th>
            <th>Ações de Estoque</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>R$ {product.price.toFixed(2)}</td>
                <td style={{ fontSize: '18px', color: product.stock_quantity > 0 ? 'green' : 'red' }}>
                  <strong>{product.stock_quantity}</strong>
                </td>
                <td>
                  <button 
                    onClick={() => handleMovement(product.id, 'IN')}
                    style={{ marginRight: '8px', cursor: 'pointer', backgroundColor: '#e6f4ea', border: '1px solid #4CAF50', padding: '4px 8px' }}>
                    + Entrada
                  </button>
                  <button 
                    onClick={() => handleMovement(product.id, 'OUT')}
                    style={{ cursor: 'pointer', backgroundColor: '#fce8e6', border: '1px solid #f44336', padding: '4px 8px' }}>
                    - Saída
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;