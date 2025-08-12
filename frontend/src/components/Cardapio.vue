<template>
  <div class="cardapio">
    <!-- Título do cardápio -->
    <h2>{{ categoria }}</h2>
    <hr class="divisoria" />

    <!-- Navegação de Categorias -->
    <div class="tabs">
      <a
        v-for="cat in categoryStore.categories"
        :key="cat"
        :href="`/cardapio/${cat.toLowerCase()}`"
        :class="[
          'tab',
          { active: cat.toLowerCase() === $route.params.categoria },
        ]"
      >
        {{ cat }}
      </a>
    </div>

    <!-- Botão Adicionar Item -->
    <!-- <button class="btn add-item">Adicionar Item</button> -->

    <!-- Exibindo os produtos da categoria -->
    <div class="item" v-for="(produto, index) in produtos" :key="produto.ID">
      <div class="info-produto">
        <h3 class="produto_do_cardapio">{{ produto.NOME }}</h3>
        <p class="produto_do_cardapio">{{ produto.DESCRICAO }}</p>
        <div class="price-container">
          <span v-if="produto.DESCONTO > 0" class="original-price">
            R$ {{ produto.PRECO.toFixed(2) }}
          </span>
          <span class="final-price">
            R$ {{ calcularPrecoFinal(produto).toFixed(2) }}
          </span>
        </div>
      </div>
      <div class="quantidade">
        <button @click="alterarQuantidade(produto.ID, -1)">-</button>
        <input
          type="number"
          min="0"
          :value="pedidoStore.itens[produto.ID] || 0"
          readonly
        />
        <button @click="alterarQuantidade(produto.ID, 1)">+</button>
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="botoes">
      <!-- Botão para fazer pedido -->
      <button class="btn" @click="fazerPedido">Adicionar</button>

      <!-- Animação de sucesso -->
      <div v-if="pedidoEnviado" class="alert-overlay">
        <div v-if="pedidoEnviado" class="alert-success">
          ✅ Pedido realizado com sucesso!
        </div>
      </div>

      <!-- Botões adicionais -->
      <button class="btn" @click="irParaHistorico">Enviar e Acompanhar</button>
      <button class="btn cancelar" @click="cancelarPedidos">Cancelar Pedidos</button>
    </div>
  </div>
</template>

<script>
import { usePedidoStore } from "@/stores/pedido";
import { useCategoryStore } from "@/stores/categoryStore";
import { useApiService } from "@/services/apiService"; 

export default {
  data() {
    return {
      produtos: [],
      // categorias: ["BEBIDAS", "LANCHES", "PIZZAS", "SOBREMESAS", "OUTROS"],
      categoria: "",
      pedidoEnviado: false,
    };
  },
  computed: {
    pedidoStore() {
      return usePedidoStore();
    },
    categoryStore() {
      return useCategoryStore();
    }
  },
  async created() {
    this.categoryStore.fetchCategories();

    const { getPublicItems } = useApiService(); 

    try {
      this.categoria = this.$route.params.categoria.toUpperCase();

      const todosOsProdutos = await getPublicItems();

      this.produtos = todosOsProdutos.filter(
        (p) => p.CATEGORIA === this.categoria
      );
    } catch (err) {
      console.error("Erro ao carregar produtos da API:", err);
    }
  },
  methods: {
    calcularPrecoFinal(produto) {
      if (produto.DESCONTO > 0) {
        return produto.PRECO * (1 - produto.DESCONTO / 100);
      }
      return produto.PRECO;
    },
    alterarQuantidade(produtoId, delta) {
      this.pedidoStore.alterarQuantidade(produtoId, delta);
    },

    async fazerPedido() {
      const itensSelecionados = Object.entries(this.pedidoStore.itens)
        .filter(([_, qtd]) => qtd > 0)
        .map(([id, qtd]) => ({
          produto_id: id,
          quantidade: qtd,
        }));

      if (itensSelecionados.length === 0) {
        alert(
          "Por favor, selecione ao menos um produto antes de fazer o pedido."
        );
        return;
      }

      const pedido = {
        mesa: this.pedidoStore.mesa,
        itens: itensSelecionados,
      };

      try {
        await fetch(`http://localhost:8000/pedidos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pedido),
        });

        this.pedidoEnviado = true;
        this.pedidoStore.zerarPedido();

        setTimeout(() => {
          this.pedidoEnviado = false;
        }, 3000);
      } catch (err) {
        console.error("Erro ao enviar pedido:", err);
      }
    },
    async irParaHistorico() {
      // 1. Pega a mesa atual da store
      const mesaParaFechar = this.pedidoStore.mesa;

      if (!mesaParaFechar) {
        alert("Erro: Nenhuma mesa está selecionada.");
        return;
      }

      // Adiciona uma confirmação para o usuário
      if (
        !confirm(
          `Deseja fechar os pedidos da ${mesaParaFechar} e ir para o histórico?`
        )
      ) {
        return; // O usuário cancelou a ação
      }

      try {
        // 2. Chama a rota do backend para "fechar o pedido"
        const response = await fetch(
          `http://localhost:8000/pedidos/fechar/${mesaParaFechar}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          // Se a resposta da API não for de sucesso (ex: erro 400, 404, 500)
          const erroData = await response.json();
          throw new Error(erroData.detail || "Falha ao fechar o pedido.");
        }

        // 3. Se a chamada foi bem-sucedida, zera o pedido na store local
        this.pedidoStore.zerarPedido();

        // 4. Finalmente, navega para a página de histórico
        this.$router.push("/historico");
      } catch (err) {
        console.error("Erro ao fechar pedido e ir para o histórico:", err);
        alert(`Ocorreu um erro: ${err.message}`);
      }
    },
  },
};
</script>

<style scoped>
.cardapio {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Cor do card usa a variável do tema */
  background-color: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  max-width: 95vw;
  max-height: 90vh;
  width: 215%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  font-family: "Poppins", sans-serif;
  /* Cor do texto principal usa a variável do tema */
  color: var(--color-heading);
}

.cardapio h2 {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.divisoria {
  width: 100%;
  max-width: 3300px;
  border: none;
  /* Cor da borda usa a variável do tema */
  border-top: 2px solid var(--color-border);
  margin: 1rem auto 2rem auto;
  border-radius: 2px;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.tab {
  padding: 0.8rem 1.5rem;
  /* Cor de fundo padrão do tab usa a variável do tema */
  background: var(--color-background-mute);
  border-radius: 12px;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  /* Cor do texto do tab usa a variável do tema */
  color: var(--color-text);
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  min-width: 120px;
  text-align: center;
  display: inline-block;
  cursor: pointer;
}

.tab:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.tab.active {
  /* Cor do tab ativo usa a cor primária (verde Vue) */
  background: hsla(160, 100%, 37%, 0.2);
  font-weight: 600;
  border-color: hsla(160, 100%, 37%, 1);
  color: var(--color-heading);
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Alinhamento vertical melhorado */
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  /* Cor de fundo do item usa a variável do tema */
  background-color: var(--color-background);
  /* Cor da borda usa a variável do tema */
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.info-produto {
  flex: 1;
  padding-right: 1rem;
}

.info-produto h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.25rem 0;
}

.info-produto p {
  margin: 0.25rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.info-produto span {
  font-size: 1rem;
  font-weight: bold;
  /* Cor de destaque usa a cor primária (verde Vue) */
  color: hsla(160, 100%, 37%, 1);
  margin-top: 0.5rem;
}

.quantidade {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantidade button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  /* Cor de destaque usa a cor primária (verde Vue) */
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.quantidade button:hover {
  background-color: hsla(160, 100%, 30%, 1);
}

.quantidade input {
  width: 48px;
  height: 32px;
  text-align: center;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  box-sizing: border-box;
}

.quantidade input::-webkit-inner-spin-button,
.quantidade input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.botoes {
  display: flex;
  justify-content: center; /* Centraliza os botões */
  flex-wrap: wrap; /* Permite que quebrem a linha em telas pequenas */
  margin-top: 2rem;
  gap: 1rem;
  width: 100%;
}

.btn {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  background-color: hsla(160, 100%, 30%, 1);
  transform: translateY(-2px);
}

.btn.cancelar {
  /* Classe específica para o botão de cancelar */
  background-color: #aa2e25; /* Um vermelho mais sóbrio */
}
.btn.cancelar:hover {
  background-color: #c43a31;
}

.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.alert-success {
  background-color: var(--color-background-soft);
  color: var(--color-heading);
  border: 1px solid var(--color-border-hover);
  padding: 2rem 3rem;
  border-radius: 16px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInOut 2.5s ease-in-out;
}
.price-container {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.original-price {
  font-size: 0.9rem;
  text-decoration: line-through; /* Efeito de riscado */
  color: var(--cor-texto-secundario);
}

.final-price {
  font-size: 1rem;
  font-weight: bold;
  color: hsla(160, 100%, 37%, 1); /* Cor verde de destaque */
}
</style>
