Feature: Tentativa de cancelamento sem pedido existente

  Scenario: Tentar cancelar pedido sem nenhum pedido realizado
    Given estou na página do cardápio digital como cliente
    And não realizei um pedido
    When clico em "Cancelar Pedido"
    Then deve ser mostrado uma mensagem ao usuário que não existe um pedido da mesa ainda