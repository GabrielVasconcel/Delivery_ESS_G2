// Arquivo: src/stores/itemStore.ts
import { defineStore } from 'pinia';
import itemService, { type Produto } from '@/services/itemService';

interface State {
  items: Produto[];
  isLoading: boolean;
  error: string | null;
}

export const useItemStore = defineStore('item', {
  state: (): State => ({
    items: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchItems() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await itemService.getItems();
        this.items = response.data;
      } catch (err) {
        this.error = 'Falha ao carregar os itens do cardápio.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async addItem(itemData: Omit<Produto, 'ID'>) {
      try {
        await itemService.createItem(itemData);
        await this.fetchItems();
      } catch (err) {
        this.error = 'Falha ao adicionar o item.';
        console.error(err);
      }
    },
    async removeItem(itemId: string) {
        try {
            await itemService.deleteItem(itemId);
            this.items = this.items.filter(item => item.ID !== itemId);
        } catch (err) {
            this.error = 'Falha ao remover o item.';
            console.error(err);
        }
    },

    async updateItem(itemId: string, itemData: Partial<Produto>) {
        try {
            // Chama o serviço para atualizar o item no backend
            const response = await itemService.updateItem(itemId, itemData);
            // Atualiza o item na lista local com os dados retornados pela API
            const index = this.items.findIndex(item => item.ID === itemId);
            if (index !== -1) {
                this.items[index] = response.data;
            }
        } catch (err) {
            this.error = 'Falha ao atualizar o item.';
            console.error(err);
        }
    }
  },
});