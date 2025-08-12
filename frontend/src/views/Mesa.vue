<template>
  <div class="container">
    <div class="cardapio">
      <h1 class="titulo-restaurante">
        Bem-vindo ao Restaurante G2-ESS-Cardapio 2025.1!
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

      <!-- Navegação de Categorias -->
      <button class="btn-categorias" @click="irParaCategorias" :disabled="categoryStore.isLoading">
        {{ categoryStore.isLoading ? 'Carregando...' : 'Ver Cardápio' }}
      </button>
    </div>
  </div>
</template>

<script>
import { usePedidoStore } from "@/stores/pedido";
import { useCategoryStore } from "@/stores/categoryStore";

export default {
  data() {
    return {
      // categorias: [], // Removido
    };
  },
  computed: {
    pedidoStore() {
      return usePedidoStore();
    },
    categoryStore() {
      return useCategoryStore();
    },
    mesaSelecionada: {
      get() {
        return this.pedidoStore.mesa; // A mesa que está no store
      },
      set(valor) {
        this.pedidoStore.setMesa(valor); // Atualiza o valor da mesa no store e localStorage
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
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.cardapio {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 600px;
  font-family: "Poppins", sans-serif;
}

.titulo-restaurante {
  font-size: 2.4rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.subtitulo {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #555;
}

.selecao-mesa {
  margin-bottom: 2rem;
}

.selecao-mesa label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.selecao-mesa select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.btn-categorias {
  padding: 0.8rem 1.5rem;
  background-color: #27ae60;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-categorias:hover {
  background-color: #219150;
}

.btn-categorias:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
</style>
