import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import type { Category } from '../assets/types/category';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar as categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Carregando categorias...</p>;

  return (
    <div>
      <h2>Categorias de Estoque</h2>
      <ul>
        {categories.length > 0 ? (
          categories.map(category => (
            <li key={category.id}>{category.name}</li>
          ))
        ) : (
          <p>Nenhuma categoria cadastrada ainda.</p>
        )}
      </ul>
    </div>
  );
};