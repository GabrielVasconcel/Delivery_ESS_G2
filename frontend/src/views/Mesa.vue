<template>
  <div class="container">
    <div class="card">
      <h1 class="titulo">
        🍽️ Bem-vindo ao <br />
        <span class="destaque">Restaurante G2-ESS-Cardápio 2025.1!</span>
      </h1>
      <p class="subtitulo">Escolha sua mesa e veja nosso cardápio completo.</p>

      <!-- Seleção da Mesa -->
      <div class="selecao-mesa">
        <label for="mesa">Informe sua mesa:</label>
        <select id="mesa" v-model="mesaSelecionada">
          <option v-for="n in 5" :key="n" :value="`mesa_${n}`">
            Mesa {{ n }}
          </option>
        </select>
      </div>

      <!-- Botão -->
      <button class="btn" @click="irParaCategorias" :disabled="categoryStore.isLoading">
        {{ categoryStore.isLoading ? 'Carregando...' : 'Ver Cardápio' }}
      </button>
    </div>
  </div>
</template>

<script>
import { usePedidoStore } from "@/stores/pedido";
import { useCategoryStore } from "@/stores/categoryStore";

export default {
  computed: {
    pedidoStore() {
      return usePedidoStore();
    },
    categoryStore() {
      return useCategoryStore();
    },
    mesaSelecionada: {
      get() {
        return this.pedidoStore.mesa;
      },
      set(valor) {
        this.pedidoStore.setMesa(valor);
      },
    },
  },
  created() {
    this.categoryStore.fetchCategories();
  },
  methods: {
    irParaCategorias() {
      if (!this.mesaSelecionada) {
        alert("Por favor, selecione sua mesa antes de continuar.");
        return;
      }
      const primeiraCategoria = this.categoryStore.categories[0];
      if (primeiraCategoria) {
        this.$router.push(`/cardapio/${primeiraCategoria.toLowerCase()}`);
      } else {
        alert("Nenhuma categoria encontrada. O administrador precisa adicionar categorias primeiro.");
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Fundo mais escuro com gradiente */
  background: linear-gradient(135deg, #1b1f1d, #2a3b34);
  
  padding: 1rem;
  z-index: 999;
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
  max-width: 500px;
  font-family: "Poppins", sans-serif;
}

.titulo {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.destaque {
  color: #27ae60;
}

.subtitulo {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
}

.selecao-mesa {
  margin-bottom: 2rem;
}

.selecao-mesa label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #2c3e50;
}

.selecao-mesa select {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
  outline: none;
  transition: border 0.3s ease;
}

.selecao-mesa select:focus {
  border-color: #27ae60;
}

.btn {
  padding: 0.8rem 1.5rem;
  background-color: #27ae60;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: #219150;
  transform: translateY(-2px);
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
}
</style>
