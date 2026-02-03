## POC - Criado com Playwright MCP 
# language: pt
Funcionalidade: Validação de Componentes da Página de Inventário
  Como um usuário do sistema
  Quero validar que todos os componentes estão presentes na página de inventário
  Para garantir que a interface está completa e funcional

  Contexto:
    Dado que estou logado no sistema
    E estou na página de inventário

  @inventory @components
  Cenario: Validar componentes principais da página de inventário
    Entao devo ver o título "Products"
    E devo ver o menu hamburguer
    E devo ver o carrinho de compras
    E devo ver o filtro de ordenação
    E devo ver o rodapé com links sociais

  @inventory @components @products
  Cenario: Validar lista de produtos disponíveis
    Entao devo ver 6 produtos na lista
    E cada produto deve ter uma imagem
    E cada produto deve ter um nome
    E cada produto deve ter uma descrição
    E cada produto deve ter um preço
    E cada produto deve ter um botão "Add to cart"

  @inventory @components @sorting
  Cenario: Validar opções de ordenação
    Entao devo ver as seguintes opções de ordenação:
      | Name (A to Z)         |
      | Name (Z to A)         |
      | Price (low to high)   |
      | Price (high to low)   |

  @inventory @components @products-list
  Cenario: Validar produtos específicos exibidos
    Entao devo ver os seguintes produtos:
      | Sauce Labs Backpack               | $29.99 |
      | Sauce Labs Bike Light             | $9.99  |
      | Sauce Labs Bolt T-Shirt           | $15.99 |
      | Sauce Labs Fleece Jacket          | $49.99 |
      | Sauce Labs Onesie                 | $7.99  |
      | Test.allTheThings() T-Shirt (Red) | $15.99 |

  @inventory @components @footer
  Cenario: Validar links do rodapé
    Entao devo ver o link do Twitter no rodapé
    E devo ver o link do Facebook no rodapé
    E devo ver o link do LinkedIn no rodapé
    E devo ver o texto de copyright
