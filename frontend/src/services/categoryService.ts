import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/categorias',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interface para o corpo da requisição de criação/atualização
export interface CategoriaPayload {
  categoria: string;
}

export default {
  // Busca todas as categorias (GET /)
  getCategorias() {
    return apiClient.get<string[]>('/');
  },

  // Cria uma nova categoria (POST /)
  createCategoria(data: CategoriaPayload) {
    return apiClient.post('/', data);
  },

  // Atualiza o nome de uma categoria (PUT /{nome_antigo})
  updateCategoria(nomeAntigo: string, data: CategoriaPayload) {
    return apiClient.put(`/${encodeURIComponent(nomeAntigo)}`, data);
  },

  // Remove uma categoria pelo nome (DELETE /{nome})
  deleteCategoria(nome: string) {
    return apiClient.delete(`/${encodeURIComponent(nome)}`);
  }
};