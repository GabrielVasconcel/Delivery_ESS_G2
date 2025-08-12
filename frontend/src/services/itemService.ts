// Arquivo: src/services/itemService.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // A URL onde seu backend FastAPI está rodando
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define a "forma" de um Produto para o TypeScript
export interface Produto {
  ID: string;
  NOME: string;
  DESCRICAO: string;
  PRECO: number;
  DESCONTO: number;
  CATEGORIA: string;
}

export default {
  // Busca todos os itens (GET /admin/items/)
  getItems() {
    return apiClient.get<Produto[]>('/admin/items/');
  },
  // Cria um novo item (POST /admin/items/)
  createItem(data: Omit<Produto, 'ID'>) {
    return apiClient.post<Produto>('/admin/items/', data);
  },
  // Remove um item pelo ID (DELETE /admin/items/{id})
  deleteItem(id: string) {
    return apiClient.delete(`/admin/items/${id}`);
  },
    // Atualiza um item pelo ID (PUT /admin/items/{id})
  updateItem(id: string, data: Partial<Produto>) {
    return apiClient.put<Produto>(`/admin/items/${id}`, data);
  }

};