Feature: Histórico de pedidos
    As a usuário comum
    I want to ser capaz de ver o histórico de pedidos
    So that eu possa verificar detalhes dos pedidos anteriores

Background:
    Given estou autenticado como um usuário comum chamado "Gabriel"
    And eu estou na página “Histórico de pedidos”


Scenario: Filtragem de histórico com item correspondente

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    And o pedido de número "3333" com apenas o item “Salada” data "20/10/2025" status "concluído"  e valor total "R$ 12,99"   
    When eu pesquiso pelo nome “Hamburger duplo”
    Then eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo” data "20/10/2025" status "concluído"  e valor total "R$ 24,99"

Scenario: Filtragem de histórico sem item correspondente

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    And o pedido de número "3333" com apenas o item “Salada” data "20/10/2025" status "concluído"  e valor total "R$ 12,99"   
    When eu pesquiso pelo nome “Milkshake de morango”
    Then eu vejo uma mensagem de busca sem sucesso
    And eu vejo que o histórico não tem pedidos

Scenario: Deletar histórico completo

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    And o pedido de número "3333" com apenas apenas o item “Salada” data "20/10/2025" status "concluído"  e valor total "R$ 12,99"   
    When eu seleciono “deletar histórico”
    Then eu vejo uma mensagem de confirmação
    And eu vejo que o histórico não tem pedidos

Scenario: Deletar pedido do histórico

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    And o pedido de número "3333" com apenas o item “Salada” data "20/10/2025" status "concluído"  e valor total "R$ 12,99"   
    When eu seleciono “deletar pedido” para o pedido “Hamburger duplo” de número "5555"
    Then eu vejo uma mensagem de confirmação
    And eu vejo que o histórico tem apenas o pedido de número "3333" com apenas o item “Salada” data "20/10/2025" status "concluído"  e valor total "R$ 12,99"


Scenario: Repetir pedido a partir do histórico

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    When eu seleciono “repetir pedido” para o pedido “Hamburger duplo” de número "5555"
    Then eu sou direcionado para a "Carrinho de compras"
    And eu vejo o item “Hamburger duplo” com preço "24,99" no carrinho

Scenario:Ver detalhes do pedido no histórico

    Given eu vejo apenas o pedido de número "5555" com apenas o item “Hamburger duplo" data "20/10/2025" status "concluído"  e valor total "R$ 24,99" 
    When eu seleciono “detalhes do pedido” para o pedido “Hamburger duplo” de número "5555"
    Then eu posso ver que “Hamburger duplo” tem o valor “24,99” e numero da mesa “4”
