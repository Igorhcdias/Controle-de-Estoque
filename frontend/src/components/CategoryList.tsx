import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category } from '../assets/types/category';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar as categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await api.post('/categories/', { name: newCategoryName });
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      alert(error.response?.data?.detail || "Erro ao excluir categoria.");
    }
  };

  if (loading) return <p style={{ color: '#a0a0a0' }}>Carregando categorias...</p>;

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#ffffff', marginBottom: '20px' }}>Gestão de Categorias</h3>
      
      <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Nova categoria..." 
          value={newCategoryName} 
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={{ padding: '8px 12px', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          Adicionar
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categories.length > 0 ? (
          categories.map(category => (
            <li key={category.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121212', padding: '12px 16px', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
              <span style={{ color: '#e0e0e0' }}>{category.name}</span>
              <button onClick={() => handleDeleteCategory(category.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }} title="Excluir Categoria">
                🗑️
              </button>
            </li>
          ))
        ) : (
          <p style={{ color: '#a0a0a0', margin: 0 }}>Nenhuma categoria cadastrada.</p>
        )}
      </ul>
    </div>
  );
};