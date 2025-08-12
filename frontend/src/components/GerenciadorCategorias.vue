<template>
  <div class="card">
    <h2>Gerenciar Categorias</h2>

    <!-- Formulário para adicionar nova categoria -->
    <form @submit.prevent="handleCreateCategory" class="add-category-form">
      <input
        v-model="newCategoryName"
        placeholder="Nome da Nova Categoria"
        required
      />
      <button type="submit" :disabled="categoryStore.isLoading">
        {{ categoryStore.isLoading ? 'Adicionando...' : 'Adicionar Categoria' }}
      </button>
    </form>
    
    <div v-if="categoryStore.isLoading && categoryStore.categories.length === 0">Carregando categorias...</div>
    
    <ul v-else-if="categoryStore.categories.length > 0" class="category-list">
      <li v-for="category in categoryStore.categories" :key="category" class="category-item">
        <span>{{ category }}</span>
        <div class="actions">
          <button @click.stop="toggleMenu(category)" class="menu-button">⋮</button>
          <div v-if="activeMenu === category" class="dropdown-menu">
            <button @click="openEditModal(category)">Editar</button>
            <button @click="openDeleteModal(category)">Excluir</button>
          </div>
        </div>
      </li>
    </ul>
     <!-- Estado de Vazio -->
    <div v-else class="empty-state">
      <p>Nenhuma categoria cadastrada.</p>
    </div>
  </div>

  <!-- Modal para Editar Categoria -->
  <div v-if="isEditModalVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>Editar Categoria</h2>
      <form @submit.prevent="handleSaveCategory">
        <label>Nome da Categoria</label>
        <input v-model="editingCategory.name" required />
        <div class="modal-actions">
          <button type="submit" class="btn btn-save" :disabled="categoryStore.isLoading">
            {{ categoryStore.isLoading ? 'Salvando...' : 'Salvar' }}
          </button>
          <button type="button" @click="closeModal" class="btn btn-cancel">Cancelar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal de Confirmação para Excluir -->
  <div v-if="isDeleteModalVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>Confirmar Exclusão</h2>
      <p>Tem certeza que deseja excluir a categoria "<strong>{{ categoryToDelete }}</strong>"?</p>
      <div class="modal-actions">
        <button @click="handleConfirmDelete" class="btn btn-delete" :disabled="categoryStore.isLoading">
           {{ categoryStore.isLoading ? 'Excluindo...' : 'Confirmar' }}
        </button>
        <button type="button" @click="closeModal" class="btn btn-cancel">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';

const categoryStore = useCategoryStore();

const activeMenu = ref<string | null>(null);
const newCategoryName = ref('');

const isEditModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const editingCategory = reactive({ oldName: '', name: '' });
const categoryToDelete = ref<string | null>(null);

const toggleMenu = (categoryName: string) => {
  activeMenu.value = activeMenu.value === categoryName ? null : categoryName;
};

const closeModal = () => {
  isEditModalVisible.value = false;
  isDeleteModalVisible.value = false;
  activeMenu.value = null;
};

const openEditModal = (categoryName: string) => {
  editingCategory.oldName = categoryName;
  editingCategory.name = categoryName;
  isEditModalVisible.value = true;
};

const openDeleteModal = (categoryName: string) => {
  categoryToDelete.value = categoryName;
  isDeleteModalVisible.value = true;
};

const handleCreateCategory = async () => {
  if (!newCategoryName.value.trim()) return;
  try {
    await categoryStore.addCategory({ categoria: newCategoryName.value });
    alert('Categoria criada com sucesso!');
    newCategoryName.value = '';
  } catch (error: any) {
    alert(`Erro: ${error.message}`);
  }
};

const handleSaveCategory = async () => {
  if (!editingCategory.name.trim()) return;
  try {
    await categoryStore.updateCategory(editingCategory.oldName, { categoria: editingCategory.name });
    alert('Categoria atualizada com sucesso!');
    closeModal();
  } catch (error: any) {
    alert(`Erro: ${error.message}`);
  }
};

const handleConfirmDelete = async () => {
  if (!categoryToDelete.value) return;
  try {
    await categoryStore.removeCategory(categoryToDelete.value);
    alert('Categoria removida com sucesso!');
    closeModal();
  } catch (error: any) {
    alert(`Erro: ${error.message}`);
  }
};

onMounted(() => {
  categoryStore.fetchCategories();
  window.addEventListener('click', () => {
    if (activeMenu.value) {
      activeMenu.value = null;
    }
  });
});
</script>

<style scoped>
.card {
  background: #202020;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  margin-bottom: 2.5rem;
  border: 1px solid #3a3a3a;
  color: #e0e0e0;
}
.add-category-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.add-category-form input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #3a3a3a;
  background-color: #34495e;
  color: #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}
.add-category-form button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  transition: background-color 0.2s;
}
.add-category-form button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
  border: 2px dashed #3a3a3a;
  border-radius: 8px;
}
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}
.actions {
  position: relative;
}
.menu-button {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #34495e;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  z-index: 10;
  display: flex;
  flex-direction: column;
}
.dropdown-menu button {
  background: none;
  border: none;
  color: #e0e0e0;
  padding: 0.75rem 1.5rem;
  text-align: left;
  width: 100%;
  cursor: pointer;
}
.dropdown-menu button:hover {
  background-color: hsla(160, 100%, 37%, 0.5);
}
.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: #202020;
  padding: 2rem;
  border-radius: 12px;
  width: 90%; max-width: 500px;
  border: 1px solid #3a3a3a;
}
.modal-content form {
  display: flex; flex-direction: column; gap: 1.25rem;
}
.modal-content label {
  font-weight: bold; margin-bottom: -0.75rem; color: #a0a0a0; font-size: 0.9rem;
}
.modal-content input {
  width: 100%; padding: 0.75rem; border: 1px solid #3a3a3a; background-color: #34495e;
  color: #e0e0e0; border-radius: 8px; font-size: 1rem; box-sizing: border-box;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;
}
.btn {
  padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer;
  font-weight: bold; color: white;
}
.btn-save { background-color: hsla(160, 100%, 37%, 1); }
.btn-delete { background-color: #c0392b; }
.btn-cancel { background-color: #7f8c8d; }
.btn:disabled { background-color: #555; cursor: not-allowed; }
</style>
