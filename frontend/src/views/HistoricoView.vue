<template>
  <div class="historico-container">
    <h1>Histórico de Pedidos</h1>
    <p>Exibindo histórico para a <strong>mesa</strong>.</p>

    <div class="area-busca">
      <input
        type="text"
        v-model="termoBusca"
        placeholder="Buscar por item ou categoria..."
        @keydown.enter="aplicarFiltrosEBuscar"
      />
      <button @click="aplicarFiltrosEBuscar">Buscar</button>
    </div>

    <div class="area-filtros">
      <strong>Filtrar por Status:</strong>
      <div class="opcoes-filtro">
        <label v-for="status in statusDisponiveis" :key="status">
          <input type="checkbox" :value="status" v-model="statusSelecionados" />
          <span>{{ status }}</span>
        </label>
      </div>
    </div>

    <div class="area-filtros">
      <div class="opcoes-filtro"></div>

      <div class="filtro-data">
        <strong>Filtrar por Data:</strong>
        <input type="date" v-model="dataSelecionada" />
      </div>
    </div>

    <div v-if="carregando" class="loading">
      Buscando dados do servidor... ⏳
    </div>

    <div v-else-if="erro" class="error">
      <strong>Ocorreu um erro:</strong> {{ erro }}
    </div>

    <div v-else-if="pedidos.length === 0" class="empty">
      Nenhum pedido encontrado no histórico para esta mesa.
    </div>

    <ul v-else class="lista-pedidos">
      <li
        v-for="pedido in pedidos"
        :key="pedido.id_historico"
        class="pedido-item"
        @click="toggleExpandir(pedido.id_historico)"
        :class="{ expandido: pedido.id_historico === idPedidoExpandido }"
      >
        <div class="pedido-header">
          <strong>Pedido #{{ pedido.id_historico }}</strong>
          <span>{{
            new Date(pedido.data_fechamento).toLocaleString("pt-BR")
          }}</span>
          <span :class="['status', pedido.status]">{{ pedido.status }}</span>
        </div>

        <div class="pedido-body">
          <ul class="itens-lista">
            <li
              v-for="item in pedido.itens"
              :key="item.produto_id"
              class="item"
            >
              <div>
                <span class="item-quantidade">{{ item.quantidade }}x </span>
                <span class="item-nome">{{ item.nome }}</span>
              </div>
              <span
                v-if="pedido.id_historico === idPedidoExpandido"
                class="item-valor"
              >
                R$ {{ (item.valor_unitario * item.quantidade).toFixed(2) }}
              </span>
            </li>
          </ul>
        </div>

        <div class="detalhes-expansiveis">
          <div class="conteudo-secreto">
            <div class="pedido-resumo">
              <span> Total: R$ {{ pedido.total.toFixed(2) }}</span>
            </div>
            <div class="pedido-acoes">
              <button class="btn-refazer" @click.stop="refazerPedido(pedido)">
                Refazer Pedido
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useApiService } from "../services/apiService";
import type { PedidoHistorico } from "../services/apiService";
import { usePedidoStore } from "@/stores/pedido";
import { useRouter } from "vue-router";

const pedidoStore = usePedidoStore();
const router = useRouter();

// Guarda o ID do pedido que está expandido. Se for 'null', nenhum está.
const idPedidoExpandido = ref<string | null>(null);

// Função para expandir/recolher um card
function toggleExpandir(pedidoId: string) {
  // Se o ID clicado já for o que está expandido, recolhe
  if (idPedidoExpandido.value === pedidoId) {
    idPedidoExpandido.value = null;
  } else {
    // Senão, expande o novo ID.
    idPedidoExpandido.value = pedidoId;
  }
}

// Função para refazer o pedido
function refazerPedido(pedido: PedidoHistorico) {
  pedidoStore.preencherCarrinhoComHistorico(pedido.itens);
  router.push("/cardapio/bebidas");
}

const { getHistoricoPorMesa, filtrarHistorico } = useApiService();

// ESTADO REATIVO
const todosOsPedidos = ref<PedidoHistorico[]>([]);
const pedidos = ref<PedidoHistorico[]>([]);
const carregando = ref(true);
const erro = ref<string | null>(null);

// ESTADO PARA OS FILTROS
const termoBusca = ref("");
const statusDisponiveis = ref(["em andamento", "concluido", "cancelado"]);
const statusSelecionados = ref<string[]>([]);
const dataSelecionada = ref(""); // <-- NOVA VARIÁVEL PARA A DATA

// FUNÇÃO DE BUSCA GERAL
const aplicarFiltrosEBuscar = async () => {
  const mesaAtual = pedidoStore.mesa;
  carregando.value = true;
  erro.value = null;
  // Se nenhum filtro estiver ativo, restaura a lista original.
  if (
    !termoBusca.value.trim() &&
    statusSelecionados.value.length === 0 &&
    !dataSelecionada.value
  ) {
    pedidos.value = todosOsPedidos.value;
    carregando.value = false;
    return;
  }

  try {
    const promessasDeBusca = [];
    const busca = termoBusca.value.trim();
    const statuses = statusSelecionados.value;
    const data = dataSelecionada.value;

    // Monta o filtro base que será comum a todas as chamadas
    const filtrosBase: { data?: string; status?: string } = {};
    if (data) {
      filtrosBase.data = data;
    }

    // Prepara o loop de status (se nenhum for selecionado, busca em todos)
    const loopStatuses = statuses.length > 0 ? statuses : [undefined];

    for (const status of loopStatuses) {
      const filtrosComStatus = { ...filtrosBase };
      if (status) {
        filtrosComStatus.status = status;
      }

      if (busca) {
        // Combina o filtro de texto (nome E categoria) com os filtros base
        promessasDeBusca.push(
          filtrarHistorico(mesaAtual, { ...filtrosComStatus, nome_item: busca })
        );
        promessasDeBusca.push(
          filtrarHistorico(mesaAtual, { ...filtrosComStatus, categoria: busca })
        );
      } else {
        // Se não há texto, faz a busca apenas com os filtros base (data e/ou status)
        promessasDeBusca.push(filtrarHistorico(mesaAtual, filtrosComStatus));
      }
    }

    // Executa todas as buscas em paralelo
    const resultadosDasBuscas = await Promise.all(promessasDeBusca);

    // Junta todos os resultados e remove duplicados
    const resultadosCombinados = new Map<string, PedidoHistorico>();
    resultadosDasBuscas.forEach((arrayDePedidos) => {
      arrayDePedidos.forEach((p) =>
        resultadosCombinados.set(p.id_historico, p)
      );
    });

    const listaFinal = Array.from(resultadosCombinados.values());
    listaFinal.sort(
      (a, b) =>
        new Date(b.data_fechamento).getTime() -
        new Date(a.data_fechamento).getTime()
    );

    pedidos.value = listaFinal;
  } catch (err) {
    console.error("Falha ao filtrar histórico:", err);
    erro.value = "Ocorreu um erro durante a busca.";
  } finally {
    carregando.value = false;
  }
};

// Atualiza a lista de pedidos quando os filtros mudam
let debounceTimer: number;
watch(
  [termoBusca, statusSelecionados, dataSelecionada],
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      aplicarFiltrosEBuscar();
    }, 500);
  },
  { deep: true }
); // 'deep' é importante para 'observar' mudanças dentro do array de status

onMounted(async () => {
  try {
    const mesaAtual = pedidoStore.mesa;
    const pedidosDaApi = await getHistoricoPorMesa(mesaAtual);

    pedidosDaApi.sort((a, b) => {
      return (
        new Date(b.data_fechamento).getTime() -
        new Date(a.data_fechamento).getTime()
      );
    });

    todosOsPedidos.value = pedidosDaApi; // Guarda a lista completa
    pedidos.value = pedidosDaApi;
  } catch (err) {
    console.error("Falha ao buscar histórico:", err);
    erro.value =
      "Não foi possível conectar ao servidor para buscar o histórico.";
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
.historico-container {
  padding: 1rem;
  width: 200%;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.loading,
.error,
.empty {
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
}
.error {
  color: #d9534f;
}
.lista-pedidos {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
  gap: 1.5rem;
  text-align: left;
}
.pedido-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--color-background-soft);
  cursor: pointer; /* Indica que o item é clicável */
  transition: all 0.3s ease-in-out;
}

/* Quando o item não está expandido, não muda nada */
.pedido-item:not(.expandido):hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Destaca o item expandido */
.pedido-item.expandido {
  border-color: hsla(160, 100%, 37%, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.detalhes-expansiveis {
  display: grid;
  /* Esconde o conteúdo por padrão*/
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease-in-out;
}

.pedido-item.expandido .detalhes-expansiveis {
  /* Quando expandido, o grid cresce para acomodar o conteúdo */
  grid-template-rows: 1fr;
}

/* O conteúdo dentro da área expansível precisa de 'overflow: hidden' 
   para que a animação funcione corretamente */
.detalhes-expansiveis > * {
  overflow: hidden;
}

.item {
  display: flex;
  justify-content: space-between;
}

.item-valor {
  font-style: italic;
  color: var(--color-text-mute);
}

.btn-refazer {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-background);
  border: 1px solid hsla(160, 100%, 37%, 1);
  color: hsla(160, 100%, 37%, 1);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refazer:hover {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
}
.pedido-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.pedido-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text-mute);
}
.pedido-resumo {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-heading);
}

.pedido-acoes {
  margin-top: 1rem;
  text-align: left;
}
.status {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
}
.status.concluido {
  background-color: #2f9c4c;
  color: white;
}
.status.em.andamento {
  background-color: #f0ad4e;
  color: white;
}
.status.cancelado {
  background-color: #d9534f;
  color: white;
}
.area-busca {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.area-busca input {
  flex-grow: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.area-busca button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.area-busca button:hover {
  background-color: hsla(160, 100%, 30%, 1);
}
.area-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
}

.opcoes-filtro {
  display: flex;
  gap: 0.5rem;
}

/* Esconde o checkbox padrão, mas o mantém funcional e acessível */
.opcoes-filtro input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  width: 1px;
  height: 1px;
}

/* Estiliza o texto (span) para que ele se pareça com um botão */
.opcoes-filtro span {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 20px; /* Deixa as bordas bem arredondadas (estilo "pill") */
  cursor: pointer;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  text-transform: capitalize;
}

.opcoes-filtro span:hover {
  border-color: hsla(160, 100%, 37%, 0.5);
  background-color: var(--color-background-mute);
}

/* Quando o checkbox invisível está MARCADO (:checked),
   muda o estilo do span que vem logo depois (+) */
.opcoes-filtro input[type="checkbox"]:checked + span {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: hsla(160, 100%, 37%, 1);
}
.filtro-data {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtro-data input[type="date"] {
  padding: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.item-valor {
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  font-style: italic;
  color: var(--color-text-mute);
}

/* Quando o card está expandido, o valor do item se torna visível */
.pedido-item.expandido .item-valor {
  opacity: 1;
}

.detalhes-expansiveis {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease-in-out;
}

.pedido-item.expandido .detalhes-expansiveis {
  grid-template-rows: 1fr;
}

.detalhes-expansiveis > .conteudo-secreto {
  overflow: hidden;
}

.pedido-acoes {
  opacity: 0;
  transition: opacity 0.4s ease-in-out 0.2s;
}

.pedido-item.expandido .pedido-acoes {
  opacity: 1;
}
</style>
