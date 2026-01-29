# language: pt
Funcionalidade: Autenticação no Swag Labs
  Como um cliente do e-commerce
  Quero acessar minha conta
  Para realizar compras de produtos geek

  @task1 @login
  Cenario: Login com sucesso (Fluxo Positivo)
    Dado que estou na página de login
    Quando preencho as credenciais válidas
    Entao devo ser redirecionado para a vitrine de produtos

  @task1 @login @negativo
  Esquema do Cenario: Tentativa de login com falha (Fluxos Negativos)
    Dado que estou na página de login
    Quando tento logar com usuario "<usuario>" e senha "<senha>"
    Entao devo ver a mensagem de erro "<mensagem>"

    Exemplos:
      | usuario         | senha          | mensagem                                              |
      | standard_user   | senha_errada   | Epic sadface: Username and password do not match      |
      | locked_out_user | secret_sauce   | Epic sadface: Sorry, this user has been locked out.   |
      |                 | secret_sauce   | Epic sadface: Username is required                    |