import axios from 'axios';
import type { Category } from '../assets/types/category';

export const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Estoque:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCategories = async () => {
  const response = await api.get<Category[]>('/categories/');
  return response.data;
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const response = await api.post<Category>('/categories/', category);
  return response.data;
};