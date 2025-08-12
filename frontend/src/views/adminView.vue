<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useItemStore } from '../stores/itemStore';
import type { Produto } from '../services/itemService'; 

const itemStore = useItemStore();

// --- Lógica para Adicionar Item (RE-ADICIONADA) ---
const newItemForm = reactive({
  NOME: '',
  DESCRICAO: '',
  PRECO: 0,
  CATEGORIA: 'OUTROS',
  DESCONTO: 0
});

const handleAddItem = async () => {
  await itemStore.addItem(newItemForm);
  // Limpa o formulário após o envio
  newItemForm.NOME = '';
  newItemForm.DESCRICAO = '';
  newItemForm.PRECO = 0;
};

// --- Lógica para Remover Item (já existente) ---
const handleDeleteItem = async (id: string) => {
  if (confirm('Tem certeza que deseja remover este item?')) {
    await itemStore.removeItem(id);
  }
};

// --- Lógica para Editar Item (já existente) ---
const isEditModalVisible = ref(false);
const editingItem = ref<Produto | null>(null);

const openEditModal = (item: Produto) => {
  editingItem.value = { ...item }; 
  isEditModalVisible.value = true;
};

const handleUpdateItem = async () => {
  if (!editingItem.value) return;
  await itemStore.updateItem(editingItem.value.ID, editingItem.value);
  isEditModalVisible.value = false;
};

// Busca os itens da API quando a página é carregada
onMounted(() => {
  itemStore.fetchItems();
});
</script>

<template>
  <div class="admin-view">
    <h1>Painel de Administração de Itens</h1>

<div class="card add-item-card">
  <h2>Adicionar Novo Item</h2>
  <form @submit.prevent="handleAddItem">
    
    <div class="form-group">
      <input v-model="newItemForm.NOME" placeholder="Nome do Item" required />
      <input v-model="newItemForm.DESCRICAO" placeholder="Descrição" required />
    </div>
    
    <div class="form-group">
      <input v-model.number="newItemForm.PRECO" type="number" step="0.01" placeholder="Preço" required />
      <select v-model="newItemForm.CATEGORIA">
        <option>BEBIDAS</option>
        <option>LANCHES</option>
        <option>PIZZAS</option>
        <option>SOBREMESAS</option>
        <option>OUTROS</option>
      </select>
      <button type="submit">Adicionar Item</button>
    </div>

  </form>
</div>

    <div class="card">
      <h2>Itens Cadastrados</h2>
      <div v-if="itemStore.isLoading">Carregando...</div>
      <div v-else-if="itemStore.error" class="error">{{ itemStore.error }}</div>
      <table v-else>
        <thead>
          <tr>
            <th>Nome</th> <th>Descrição</th> <th>Preço</th> <th>Categoria</th> <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itemStore.items" :key="item.ID">
            <td>{{ item.NOME }}</td>
            <td>{{ item.DESCRICAO }}</td>
            <td>R$ {{ item.PRECO.toFixed(2) }}</td>
            <td>{{ item.CATEGORIA }}</td>
            <td class="actions-cell">
                <button @click="openEditModal(item)" class="btn btn-edit">Editar</button>
                <button @click="handleDeleteItem(item.ID)" class="btn btn-delete">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="isEditModalVisible" class="modal-overlay">
  <div class="modal-content">
    <h2>Editar Item: {{ editingItem?.NOME }}</h2>
    <form @submit.prevent="handleUpdateItem" v-if="editingItem">
      <label>Nome</label>
      <input v-model="editingItem.NOME" required />
      <label>Descrição</label>
      <input v-model="editingItem.DESCRICAO" required />
      <label>Preço</label>
      <input v-model.number="editingItem.PRECO" type="number" step="0.01" required />
      <label>Desconto (%)</label>
      <input v-model.number="editingItem.DESCONTO" type="number" placeholder="Ex: 10 para 10%" />
      <label>Categoria</label>
      <select v-model="editingItem.CATEGORIA">
        <option>BEBIDAS</option>
        <option>LANCHES</option>
        <option>PIZZAS</option>
        <option>SOBREMESAS</option>
        <option>OUTROS</option>
      </select>
      <div class="modal-actions">
        <button type="submit" class="btn btn-save">Salvar Alterações</button>
        <button type="button" @click="isEditModalVisible = false" class="btn btn-cancel">Cancelar</button>
      </div>
    </form>
  </div>
</div>
</template>

<style scoped>
/* Paleta de Cores Principal */
:root {
  --cor-fundo: #181818;
  --cor-fundo-card: #202020;
  --cor-fundo-item: #2a2a2a;
  --cor-texto-principal: #e0e0e0;
  --cor-texto-secundario: #a0a0a0;
  --cor-borda: #3a3a3a;
  --cor-editar: hsla(160, 100%, 37%, 1); /* Verde Vue */
  --cor-editar-hover: hsla(160, 100%, 42%, 1);
  --cor-remover: #c0392b; /* Vermelho sóbrio */
  --cor-remover-hover: #e74c3c;
  --cor-cancelar-fundo: #7f8c8d;
  --cor-cancelar-hover: #95a5a6;
}

.admin-view {
  padding: 2rem;
  background-color: var(--cor-fundo);
  color: var(--cor-texto-principal);
  min-height: 100vh;
}

h1, h2 {
  text-align: center;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: var(--cor-texto-principal);
}

.card {
  background: var(--cor-fundo-card);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  margin-bottom: 2.5rem;
  border: 1px solid var(--cor-borda);
}

.add-item-card form {
  display: flex;
  flex-direction: column; /* Organiza os .form-group em coluna */
  gap: 1rem; /* Espaço entre as linhas do formulário */
}

.add-item-card .form-group {
  display: flex; /* Faz os inputs ficarem na mesma linha */
  gap: 1rem; /* Espaço entre os inputs */
}

.add-item-card .form-group > * {
  flex: 1; /* Faz cada elemento (input, select, button) crescer para ocupar o espaço disponível */
}

.add-item-card input, .add-item-card select {
  padding: 0.75rem;
  border: 1px solid var(--cor-borda);
  background-color: #34495e;
  color: var(--cor-texto-principal);
  border-radius: 8px;
  font-size: 1rem;
}

.add-item-card button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  background-color: var(--cor-editar); /* Usando o verde */
  color: white;
  transition: background-color 0.2s;
}

/* --- Estilos da Tabela de Itens --- */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 1rem;
  margin-top: 1rem;
}
th {
  color: var(--cor-texto-secundario);
  font-weight: 600;
  text-align: left;
  padding: 0 1.5rem 0.5rem 1.5rem;
}
td {
  padding: 1.5rem;
  vertical-align: middle;
}
tbody tr {
  background-color: var(--cor-fundo-item);
  border-radius: 8px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
tbody tr:hover {
  transform: translateY(-3px);
  background-color: #333;
}
td:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
td:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }

/* --- 1. & 2. Cores e Highlight para Botões de Ação --- */
.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 0.9rem;
}
.btn:hover {
  transform: scale(1.05); /* Efeito de highlight ao passar o mouse */
}
.btn-edit {
  background-color: var(--cor-editar);
}
.btn-edit:hover {
  background-color: var(--cor-editar-hover);
}
.btn-delete {
  background-color: var(--cor-remover);
}
.btn-delete:hover {
  background-color: var(--cor-remover-hover);
}

/* --- 3. Estilos para o Modal de Edição --- */
.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: var(--cor-fundo-card);
  padding: 2rem;
  border-radius: 12px;
  width: 90%; max-width: 500px;
  border: 1px solid var(--cor-borda);
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}
.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Aumenta o espaçamento no formulário */
}
.modal-content label {
  font-weight: bold;
  margin-bottom: -0.75rem;
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
}
.modal-content input, .modal-content select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--cor-borda);
  background-color: #34495e;
  color: var(--cor-texto-principal);
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box; /* Garante que o padding não aumente a largura */
}
.modal-content input:focus, .modal-content select:focus {
  outline: none;
  border-color: var(--cor-editar);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--cor-borda);
  padding-top: 1.5rem;
}
.btn-save {
  background-color: var(--cor-editar);
}
.btn-save:hover {
  background-color: var(--cor-editar-hover);
}
.btn-cancel {
  background-color: var(--cor-cancelar-fundo);
}
.btn-cancel:hover {
  background-color: var(--cor-cancelar-hover);
}
</style>