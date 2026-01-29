# language: pt
Funcionalidade: Checkout de Produtos
  Como um usuário logado
  Quero finalizar a compra de itens do carrinho
  Para receber os produtos em minha casa

  Contexto:
    Dado que estou logado
    E adicionei o produto "Sauce Labs Backpack" ao carrinho

  @task2 @checkout @smoke
  Cenario: Compra realizada com sucesso (Fluxo Positivo)
    Quando acesso o carrinho
    E prossigo para o checkout
    E preencho os dados de entrega corretamente
    E finalizo a compra
    Entao devo ver a mensagem de confirmação "Thank you for your order!"

  @task2 @checkout @negativo
  Cenario: Tentar finalizar compra sem dados de entrega (Fluxo Negativo)
    Quando acesso o carrinho
    E prossigo para o checkout
    E tento continuar sem preencher o formulário
    Entao devo ver a mensagem de erro no checkout "Error: First Name is required"