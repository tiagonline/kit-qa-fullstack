# language: pt
@favoritos
Funcionalidade: Favoritos no Swag Labs
  Como um cliente
  Quero favoritar produtos
  Para comprar mais tarde

  Cenario: Adicionar produto aos favoritos (Reuso de Login)
    Dado que estou logado
    Quando favoritado o produto "Sauce Labs Backpack"
    Então o ícone de favorito deve estar ativo para o produto "Sauce Labs Backpack"