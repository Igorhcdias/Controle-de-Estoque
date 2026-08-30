import axios from 'axios';
import type { Category } from '../assets/types/category';

const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

export const getCategories = async () => {
  const response = await api.get<Category[]>('/categories/');
  return response.data;
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const response = await api.post<Category>('/categories/', category);
  return response.data;
};