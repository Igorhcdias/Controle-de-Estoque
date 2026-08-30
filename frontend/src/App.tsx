import { useEffect, useState } from 'react';
import axios from 'axios';
import { CategoryList } from './components/CategoryList';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

type ModalView = 'MENU' | 'MOVEMENT_IN' | 'MOVEMENT_OUT' | 'EDIT_NAME' | 'DELETE';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  
  // Estados do Modal Dinâmico
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalView, setModalView] = useState<ModalView>('MENU');
  const [inputValue, setInputValue] = useState('');

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

  const closeModal = () => {
    setSelectedProduct(null);
    setModalView('MENU');
    setInputValue('');
  };

  const openAction = (view: ModalView, defaultInputValue: string = '') => {
    setModalView(view);
    setInputValue(defaultInputValue);
  };

  // Função centralizada que executa a ação confirmada no nosso modal customizado
  const executeModalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      if (modalView === 'MOVEMENT_IN' || modalView === 'MOVEMENT_OUT') {
        const quantity = parseInt(inputValue, 10);
        if (isNaN(quantity) || quantity <= 0) {
          alert("Por favor, digite um número válido maior que zero.");
          return;
        }
        await axios.post('http://127.0.0.1:8000/movements/', {
          product_id: selectedProduct.id,
          movement_type: modalView === 'MOVEMENT_IN' ? 'IN' : 'OUT',
          quantity: quantity,
          observation: `Movimentação via painel web`
        });

      } else if (modalView === 'EDIT_NAME') {
        if (!inputValue || inputValue === selectedProduct.name) return;
        await axios.put(`http://127.0.0.1:8000/products/${selectedProduct.id}`, {
          name: inputValue,
          sku: selectedProduct.sku,
          price: selectedProduct.price
        });

      } else if (modalView === 'DELETE') {
        await axios.delete(`http://127.0.0.1:8000/products/${selectedProduct.id}`);
      }

      fetchProducts();
      closeModal();
    } catch (error: unknown) {
      console.error("Erro ao executar ação:", error);
      let errorMsg = "Erro na operação.";
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      alert(errorMsg);
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h1 style={{ color: '#ffffff', marginBottom: '30px', fontWeight: '600' }}>
          Controle de Estoque
        </h1>

        <div style={{ backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #2a2a2a' }}>
          <h3 style={{ marginTop: 0, color: '#ffffff', marginBottom: '16px' }}>Cadastrar Novo Produto</h3>
          <form onSubmit={handleCreateProduct} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#a0a0a0' }}>Nome</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#a0a0a0' }}>SKU</label>
              <input required value={sku} onChange={e => setSku(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#a0a0a0' }}>Preço (R$)</label>
              <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" style={primaryButtonStyle}>Salvar</button>
          </form>
        </div>
        
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#252525' }}>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Produto</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Preço</th>
                <th style={thStyle}>Saldo</th>
                <th style={{...thStyle, textAlign: 'center'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td style={tdStyle}>{product.id}</td>
                    <td style={tdStyle}>{product.name}</td>
                    <td style={tdStyle}>{product.sku}</td>
                    <td style={tdStyle}>R$ {product.price.toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: product.stock_quantity > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {product.stock_quantity}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button 
                        onClick={() => { setSelectedProduct(product); setModalView('MENU'); }} 
                        style={iconButtonStyle}
                        title="Ações do Produto"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#a0a0a0' }}>Nenhum produto cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <hr style={{ margin: '48px 0', border: 'none', borderTop: '1px solid #2a2a2a' }} />
        <div style={{ backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
          <CategoryList />
        </div>

      </div>

      {/* MODAL DINÂMICO */}
      {selectedProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
                {modalView === 'MENU' && `Ações: ${selectedProduct.name}`}
                {modalView === 'MOVEMENT_IN' && `Entrada: ${selectedProduct.name}`}
                {modalView === 'MOVEMENT_OUT' && `Saída: ${selectedProduct.name}`}
                {modalView === 'EDIT_NAME' && `Editar: ${selectedProduct.name}`}
                {modalView === 'DELETE' && `Excluir Produto`}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            
            {/* VISTA 1: MENU PRINCIPAL */}
            {modalView === 'MENU' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => openAction('MOVEMENT_IN')} style={popupActionGreen}>+ Aumentar Quantidade</button>
                <button onClick={() => openAction('MOVEMENT_OUT')} style={popupActionOrange}>- Diminuir Quantidade</button>
                <button onClick={() => openAction('EDIT_NAME', selectedProduct.name)} style={popupActionBlue}>✎ Editar Nome do Item</button>
                <button onClick={() => openAction('DELETE')} style={popupActionRed}>🗑️ Excluir Item do Estoque</button>
              </div>
            )}

            {/* VISTA 2: FORMULÁRIOS DE AÇÃO */}
            {modalView !== 'MENU' && (
              <form onSubmit={executeModalAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Inputs baseados na ação */}
                {(modalView === 'MOVEMENT_IN' || modalView === 'MOVEMENT_OUT') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#a0a0a0' }}>Digite a quantidade:</label>
                    <input autoFocus required type="number" min="1" value={inputValue} onChange={e => setInputValue(e.target.value)} style={inputStyle} />
                  </div>
                )}

                {modalView === 'EDIT_NAME' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#a0a0a0' }}>Novo nome do produto:</label>
                    <input autoFocus required type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} style={inputStyle} />
                  </div>
                )}

                {modalView === 'DELETE' && (
                  <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 10px 0' }}>
                    Tem certeza que deseja excluir <strong>{selectedProduct.name}</strong> permanentemente?
                  </p>
                )}

                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setModalView('MENU')} style={{ ...primaryButtonStyle, backgroundColor: 'transparent', border: '1px solid #555', color: '#e0e0e0', flex: 1 }}>
                    Voltar
                  </button>
                  <button type="submit" style={{ ...primaryButtonStyle, flex: 1, backgroundColor: modalView === 'DELETE' ? '#ef4444' : '#3b82f6' }}>
                    Confirmar
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Estilos mantidos da versão anterior
const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' as const };
const primaryButtonStyle = { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' };
const iconButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' };
const thStyle = { padding: '16px', color: '#a0a0a0', fontWeight: '500', fontSize: '14px', borderBottom: '2px solid #2a2a2a' };
const tdStyle = { padding: '16px', fontSize: '14px' };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', border: '1px solid #333', minWidth: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
const popupActionGreen = { padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, fontWeight: '500' };
const popupActionOrange = { padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, fontWeight: '500' };
const popupActionBlue = { padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, fontWeight: '500' };
const popupActionRed = { padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' as const, fontWeight: '500' };

export default App;