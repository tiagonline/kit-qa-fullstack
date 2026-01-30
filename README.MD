# Kit QA Fullstack - Automação Full Stack

> Projeto de automação de testes "End-to-End" simulando um ambiente real de produção. O projeto abrange testes de API e contrato, Interface Web (BDD), Mobile (Emulação), Acessibilidade(WCAG) e Performance (Carga).

<div align="center">

<a href="https://tiagonline.github.io/kit-qa-fullstack/k6-report/" target="_blank">
  <img src="https://img.shields.io/badge/K6-Performance%20Dashboard-7D64FF?style=for-the-badge&logo=k6&logoColor=white" alt="K6 Report"/>
</a>

<a href="https://tiagonline.github.io/kit-qa-fullstack/" target="_blank">
  <img src="https://img.shields.io/badge/Allure-E2E%20Report-FF6F00?style=for-the-badge&logo=allure&logoColor=white" alt="Allure Report"/>
</a>

<a href="https://github.com/tiagonline/kit-qa-fullstack/actions">
  <img src="https://img.shields.io/github/actions/workflow/status/tiagonline/kit-qa-fullstack/workflow-pipeline.yml?style=for-the-badge&label=Build%20Status" alt="Build Status"/>
</a>

<br/>

<img src="https://img.shields.io/badge/Playwright-1.40+-green?logo=playwright&logoColor=white" alt="Playwright"/>
<img src="https://img.shields.io/badge/Cucumber-BDD-23d160?logo=cucumber&logoColor=white" alt="Cucumber"/>
<img src="https://img.shields.io/badge/Docker-Ready-blue?logo=docker&logoColor=white" alt="Docker"/>
<img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" alt="NodeJS"/>
<img src="https://img.shields.io/badge/Axe--core-A11y-orange?logo=accessibility&logoColor=white" alt="Axe-core"/>

</div>

---

## 1. Arquitetura e Estrutura

O projeto utiliza uma arquitetura modular baseada em **TypeScript**, focada em escalabilidade e facilidade de manutenção.

### 1.1 Tecnologias e Versões
* **Linguagem:** TypeScript / JavaScript (Node.js v18+)
* **E2E & Mobile:** [Playwright v1.40+](https://playwright.dev/)
* **BDD:** [CucumberJS v10+](https://github.com/cucumber/cucumber-js)
* **Performance:** [K6](https://k6.io/) com InfluxDB e Grafana via Docker.
* **CI/CD:** GitHub Actions.

### 1.2 Estrutura de Pastas
```text
kit-qa-fullstack/
├── .github/workflows/   # Pipeline de CI/CD (GitHub Actions)
├── envs/                # Distinção da execução dos testes por ambientes
│   ├── .env.dev
│   ├── .env.hmg
│   └── .env.prd
├── pages/               # Page Objects (Encapsulamento de elementos e ações)
├── tests/
|   ├── accessibility/   # Testes de acessibilidade WACG (POC)
│   ├── api/             # Testes de API e Contrato (Playwright + Faker + ZOD)
│   ├── e2e/             # Testes de Ponta a Ponta (Cucumber)
│   │   ├── features/    # Especificações de negócio (Gherkin)
│   │   ├── steps/       # Implementação técnica dos passos (TypeScript)
│   │   ├── support/     # Hooks e configurações globais do Cucumber
│   │   └── extra/       # Testes complementares (Playwright Native)
│   ├── mobile/          # Testes de responsividade mobile (Playwright)
│   └── k6-load/         # Testes de performance e carga (K6 + Docker + Grafana)
├── playwright-report/   # Evidências de execução local
├── .github/workflows/   # Pipeline paralela (GitHub Actions)
└── playwright.config.ts # Configuração centralizada do Playwright
```

---

## 2. Instalação e Dependências

Para executar este projeto localmente, necessitas de:

1. **Node.js** (v18 ou superior)  
2. **Docker** (para os testes de carga com monitorização)

#### **Dica**: Para rodar os testes de carga sem problemas de permissão no Linux, garanta que seu usuário esteja no grupo do docker: 
```bash 
sudo usermod -aG docker $USER && newgrp docker
```

### 2.1 Instalação

#### 2.1.1 Clonar o repositório:
```bash
git clone https://github.com/tiagonline/kit-qa-fullstack.git
cd kit-qa-fullstack
```

#### 2.1.2 Instalar dependências:
```bash
npm install
npx playwright install --with-deps
```

---

## 3. Segurança e Variáveis de Ambiente

O projeto utiliza a pasta `envs/` para gerenciar configurações de ambiente, garantindo que dados sensíveis e URLs sejam centralizados e fáceis de ajustar.

### 3.1 Configuração Local

Para facilitar a avaliação, o arquivo `.env.dev` já foi incluído no repositório com as configurações necessárias. O fluxo padrão de configuração seria:

1. Localizar o arquivo de exemplo `.env.example` dentro da pasta `envs`.
2. Duplicá-lo renomeando para `.env.dev`.
3. As variáveis principais configuradas são:

- **API_BASE_URL**: Endpoint da API (Padrão: `https://jsonplaceholder.typicode.com`).
- **BASE_URL**: Endpoint dos testes E2E (Padrão: `https://www.saucedemo.com/`).
- **SAUCE_USERNAME / SAUCE_PASSWORD**: Credenciais para os testes de Login e Checkout.
- **K6_BASE_URL**: Endpoint para os testes de carga K6 (Padrão: `https://httpbin.org`).
- **HEADLESS=false**: Define a visibilidade do navegador.
  - `false`: Abre o navegador visualmente (ideal para debug local).
  - `true`: Roda em background (ideal para CI/CD).

> **Nota sobre Segurança e Arquivos .env**

Neste repositório, os arquivos de configuração de ambiente (`envs/.env.dev`, etc.) foram intencionalmente commitados para facilitar a execução e avaliação do projeto por parte da equipe técnica.

Em um cenário real de produção:

1. Estes arquivos estariam listados no `.gitignore`.
2. Apenas o `.env.example` seria versionado.
3. As variáveis sensíveis seriam injetadas via **CI/CD Secrets** (GitHub Actions, Vault, etc.) durante o pipeline.

### 3.2 Segurança no CI/CD (GitHub Actions)

Por boas práticas de segurança, o arquivo **.env** não é enviado para o repositório (está no **.gitignore**).  
Nas execuções do **GitHub Actions**, estas variáveis foram configuradas como **Secrets** do repositório, permitindo que a pipeline rode de forma segura sem expor dados sensíveis em logs públicos.

> **Diferencial Técnico**: O pipeline foi otimizado para rodar os jobs em paralelos. Isso significa que os testes de API, E2E, Mobile e Performance rodam em máquinas independentes e simultâneas, garantindo escalabilidade e um feedback muito mais rápido para o time de desenvolvimento.

### 3.3 Testes de Contrato (API)

Além das validações funcionais (Status Code e Regra de Negócio), este projeto implementa **Testes de Contrato baseados em Schema** utilizando a biblioteca **Zod**.

- **Objetivo:** Garantir a integridade da interface de comunicação entre o Frontend e o Backend.
- **Como funciona:** Cada resposta da API é validada contra um schema estrito.  
  Se o backend alterar o tipo de um dado (ex: enviar `id` como `string` ao invés de `number`) ou remover um campo obrigatório, o teste falha imediatamente, mesmo que o status code seja `200`.
- **Benefício:** Maior segurança em refatorações e detecção antecipada de quebras de contrato.

---

## 4. Como Executar os Testes

| Cenário                 | Comando                    |
|-------------------------|----------------------------|
| Executar Tudo (CI)      | `npm run test:all`         |
| Testes de API           | `npm run test:api`         |
| Testes Web (BDD)        | `npm run test:e2e`         |
| Testes Mobile           | `npm run test:mobile`      |
| Teste de Performance    | `npm run k6:run`           |
| Modo Playwright         | `npx playwright test --ui` |
| Teste de Acessibilidade | `npm run test:a11y`        |

---

## 5. Evidências e Relatórios

O projeto está configurado para gerar evidências detalhadas tanto em ambiente local quanto em integração contínua.

---

### 5.1 Execução Local

Após rodar os testes na sua máquina, os relatórios podem ser encontrados nos seguintes locais:

- **API & Mobile (Playwright):**  
  - Local: `playwright-report/index.html`  
  - Para abrir: `npx playwright show-report`

- **E2E (Cucumber):**  
  - Local: `cucumber-report.html` (abrir diretamente no navegador)

- **Performance (k6):**  
  - Local: `k6-summary.json` (resumo técnico) ou veja a execução em tempo real no [Grafana](http://localhost:3000/d/fullstack-load-test) enquanto estiver executando. Configurei para abrir o dash automaticamente quando for executado.

---

### 5.2 Execução no CI/CD (GitHub Actions)

Devido a execução dos **Jobs Paralelos**, o GitHub Actions gera arquivos separados para cada especialidade. 
Para visualizá-los:

1. Abra à aba **Actions** no repositório.  
2. Clique no **workflow** executado (ex: `workflow-pipeline`).  
3. No final da página, na seção **Artifacts**, encontrará os seguintes pacotes:

   -  **api-report:** Relatórios de status e payloads da API.  
   -  **cucumber-report:** Fluxos BDD com as regras de negócio.  
   -  **mobile-report:** Evidências de responsividade mobile.  
   -  **k6-report:** Métricas de performance e carga.
   
> **Nota:** Todos os relatórios HTML podem ser visualizados descompactando o `.zip` e abrindo o `.html` pelo navegador.

---

## 6. Análise de Performance (Tarefa 2 – k6)

O teste de carga foi executado utilizando **k6** e conteinerização com **Docker**, simulando um cenário de alta disponibilidade com **500 usuários simultâneos (VUs)** por 5 minutos no plateau.

### 6.1 Resumo da Execução

| Métrica                 | Resultado Obtido | Status                       |
|--------------------------|------------------|------------------------------|
| Usuários Simultâneos     | 500 VUs          | ✅ Sucesso                   |
| Taxa de Sucesso (Checks) | 99.79%           | ✅ Sucesso                   |
| Tempo de Resposta (P95)  | 990ms            | ✅ Dentro do Limite (< 2s)   |
| Requisições Falhas       | 0.41%            | ✅ Dentro do Limite (< 5%)   |
| Total de Requisições     | 207.186          | ⚡ Alta Vazão                |

### 6.2 Infraestrutura de Monitoramento

A solução foi implementada com uma stack de observabilidade completa:

- **k6:** Motor de execução dos testes.  
- **InfluxDB:** Armazenamento de métricas em tempo real.  
- **Grafana:** Dashboard para visualização de tendências e gargalos.  

### 6.3 Insights Técnicos e Identificação de Gargalos

1. **Conformidade de Thresholds:** Todos os critérios de aceitação (SLA) foram atingidos.  
   O tempo de resposta para 95% dos usuários (P95) ficou em **990ms**, bem abaixo do limite crítico de **2000ms**.

2. **Estabilidade Sob Pressão:** O sistema manteve uma vazão média de **486 requisições por segundo (RPS)**, demonstrando resiliência.

3. **Ponto de Atenção:** Embora a taxa de erro seja baixa (**0.41%**), observou-se um aumento pontual na latência máxima (**6.35s**).  
   Isso indica que, apesar da média ser excelente, em picos extremos acima de **450 VUs**, alguns usuários podem experimentar lentidão momentânea devido ao limite da API de Mock.

---

## 7. Produção e Boas Práticas

Este projeto foi desenvolvido seguindo padrões de mercado para **produção**:

- **Page Object Model (POM):** Separação clara entre lógica de teste e seletores.  
- **Continuous Integration:** Pipeline automatizado que valida cada alteração.  
- **Observabilidade:** Monitorização de performance com dashboards profissionais com **Grafana**.  
- **Segurança:** Uso de **Secrets** para gestão de tokens e dados sensíveis.

### 7.1 Padrões de Projeto & Arquitetura

Neste projeto, implementei o padrão **Page Object Model (POM)** com uma camada adicional de abstração: o **Page Object Manager**.

#### Page Manager

Para evitar a poluição dos arquivos de `steps` com múltiplas instâncias de classes e garantir uma gestão eficiente de memória, centralizamos a criação das páginas na classe `PageManager.ts`.

#### Principais benefícios:

- **Lazy Initialization:** As páginas só são instanciadas no momento em que são realmente necessárias (uso do operador `??`).
- **Singleton Context:** Garante que cada cenário use apenas uma instância de cada página durante seu ciclo de vida.
- **Clean Steps:** Os arquivos de definição de passos (steps) ficam muito mais limpos, interagindo apenas com o Manager em vez de conhecer todas as classes do projeto.

#### Exemplo de uso nos steps:

```ts
// Em vez de instanciar cada página manualmente, usamos apenas o Manager
this.pageManager = new PageManager(this.page);

await this.pageManager.login.login(user, pass);
await this.pageManager.inventory.addItemToCart(produto);
```

---

## 8. Decisões de Produção

- **Isolamento:** Uso de Docker para garantir que o ambiente de teste de carga seja idêntico em qualquer máquina.
- **Estratégia de Dados:** Implementação de dados dinâmicos para evitar colisões em ambientes compartilhados.
- **CI Otimizado:** Divisão de jobs para paralelismo, visando a redução do tempo de build e feedback rápido (Shift-Left Testing).

---

## 9. Gestão de Ambientes e Multi-Configuração

O projeto foi desenhado para ser agnóstico ao ambiente, permitindo a alternar entre os diferentes estágios do ciclo de vida de desenvolvimento sem alteração no código fonte:

- **Ambiente de DEV:** Execução rápida de testes unitários de API e fluxos E2E básicos durante o desenvolvimento.

- **Ambiente de HMG:** Validação rigorosa de regressão, testes mobile e testes de carga (k6) para garantir a estabilidade antes do deploy.

- **Ambiente de PRD:** Execução seletiva de Smoke Tests (utilizando a tag @smoke), focando na disponibilidade dos serviços críticos (Happy Paths) sem gerar poluição de dados ou consumo desnecessário de recursos.

> **Nota:** sobre CI/CD: Enquanto localmente utilizamos a pasta envs/ para alternar contextos, em ambiente de CI (GitHub Actions), as variáveis são injetadas de forma segura via Repository Secrets, garantindo que nenhum dado sensível precise estar versionado no repositório.

---

### Exemplo de execução por ambiente:

```bash
# Rodando API em Homologação
npm run test:api:hmg

# Rodando apenas Smoke Tests em Produção
npm run test:e2e:prd
```

---

## 10. Acessibilidade e Inclusão (POC)

Como iniciativa de melhoria contínua e foco na experiência de **todos** os usuários, foi implementada uma Prova de Conceito (POC) de testes automatizados de acessibilidade.

A solução utiliza a engine do **axe-core** integrada nativamente aos testes do Playwright, permitindo "auditorias" rápidas durante a execução da pipeline.

### 10.1 Cobertura da Automação
O teste varre o DOM da aplicação em busca de violações das diretrizes internacionais **WCAG 2.1 (Web Content Accessibility Guidelines)**, cobrindo:

* ✅ Contraste de cores (Nível AA).
* ✅ Hierarquia de cabeçalhos.
* ✅ Rótulos de formulários (Labels).
* ✅ Textos alternativos em imagens (Alt text).
* ✅ Semântica ARIA.

### 10.2 Benefícios para o Projeto
* **Inclusão:** Garante que o produto seja utilizável por pessoas com deficiência.
* **SEO:** Melhorias de acessibilidade impactam diretamente o rankeamento em motores de busca.
* **Prevenção:** Detecta cerca de 50% dos erros mais comuns de acessibilidade antes de chegar em produção.

---

**Autor:** Tiago Silva
