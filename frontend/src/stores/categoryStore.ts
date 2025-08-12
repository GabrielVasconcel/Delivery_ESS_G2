import { defineStore } from 'pinia';
import categoryService from '../services/categoryService';
import type { CategoriaPayload } from '../services/categoryService';

interface CategoryState {
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await categoryService.getCategorias();
        this.categories = response.data;
      } catch (err: any) {
        this.error = 'Falha ao carregar as categorias.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    async addCategory(categoryData: CategoriaPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        await categoryService.createCategoria(categoryData);
        await this.fetchCategories(); 
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Erro ao criar categoria.';
        this.error = errorMessage;
        console.error(err);
        throw new Error(errorMessage); // Lança a mensagem de erro específica
      } finally {
        this.isLoading = false;
      }
    },

    async updateCategory(oldName: string, newNameData: CategoriaPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        await categoryService.updateCategoria(oldName, newNameData);
        await this.fetchCategories();
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Erro ao atualizar categoria.';
        this.error = errorMessage;
        console.error(err);
        throw new Error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async removeCategory(name: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await categoryService.deleteCategoria(name);
        await this.fetchCategories();
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Erro ao remover categoria.';
        this.error = errorMessage;
        console.error(err);
        throw new Error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
