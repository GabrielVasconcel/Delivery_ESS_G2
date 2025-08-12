// apiService.ts

import axios from "axios";
import type { Produto } from "./itemService";

export interface ItemPedido {
  produto_id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  categoria: string;
}

export interface PedidoHistorico {
  id_historico: string;
  mesa: string;
  itens: ItemPedido[];
  total: number;
  data_fechamento: string;
  status: "em andamento" | "concluido" | "cancelado";
}

export interface FiltrosHistorico {
  nome_item?: string;
  categoria?: string;
  data?: string;
  status?: string;
}

export function useApiService() {
  const baseUrl = "http://127.0.0.1:8000";

  async function fetchData() {
    try {
      const response = await axios.get(`${baseUrl}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
  // --- Funções de Histórico ---

  async function getHistoricoPorMesa(mesa: string): Promise<PedidoHistorico[]> {
    const response = await axios.get(`${baseUrl}/historico/${mesa}`);
    return response.data;
  }

  async function atualizarPedido(
    idHistorico: string,
    dadosDoPedido: PedidoHistorico
  ): Promise<PedidoHistorico> {
    const response = await axios.put(
      `${baseUrl}/historico/${idHistorico}`,
      dadosDoPedido
    );
    return response.data;
  }

  async function deletarPedidosDoHistorico(listaDeIds: string[]) {
    const response = await axios.delete(`${baseUrl}/historico/`, {
      data: { ids_historico: listaDeIds },
    });
    return response.data;
  }

  async function filtrarHistorico(
    mesa: string,
    filtros: FiltrosHistorico
  ): Promise<PedidoHistorico[]> {
    const response = await axios.get(`${baseUrl}/historico/${mesa}/filtrar`, {
      params: filtros,
    });
    return response.data;
  }

  // --- Função de Pedidos ---

  async function fecharPedido(mesa: string) {
    const response = await axios.post(`${baseUrl}/pedidos/fechar/${mesa}`);
    return response.data;
  }

    async function getPublicItems(): Promise<Produto[]> {
    // Usaremos a mesma rota GET que a página de admin usa para listar os itens
    const response = await axios.get(`${baseUrl}/admin/items/`);
    return response.data;
  }
  
  return {
    fetchData, // Função original
    // Novas funções adicionadas para histórico:
    getHistoricoPorMesa,
    atualizarPedido,
    deletarPedidosDoHistorico,
    filtrarHistorico,
    fecharPedido,
    getPublicItems,
  };
}
