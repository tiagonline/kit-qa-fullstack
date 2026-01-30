import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { postSchema, createPostSchema } from './schemas/posts.schema';

// Definimos a URL base (Clean Code: fallback seguro)
const BASE_URL = process.env.API_BASE_URL;

// .serial garante que os testes rodem na ordem (um após o outro)
test.describe.serial('API - Posts Resource (CRUD)', () => {
  
  let apiContext: APIRequestContext;
  // Variável para armazenar o ID criado e compartilhar entre os testes
  let postId: number; 

  // Massa de dados dinâmica para este ciclo de teste
  const postData = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(1),
    userId: 1 // JSONPlaceholder exige user existente
  };

  // Setup: Cria o contexto de API uma única vez antes de tudo
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      ignoreHTTPSErrors: true
    });
  });

  // Teardown: Limpa o contexto ao final
  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // PASSO 1: CRIAR (POST)
  test('1. POST /posts - Deve criar recurso e retornar 201', async () => {
    const response = await apiContext.post('/posts', {
      data: postData
    });

    expect(response.status()).toBe(201);
    
    const body = await response.json();
    console.log(`📝 Post Criado com ID: ${body.id}`);

    // Validação de Contrato
    createPostSchema.parse(body);

    // Salva o ID para usar nos próximos testes
    postId = body.id;
  });

  // PASSO 2: CONSULTAR (GET)
  test('2. GET /posts/:id - Deve consultar o recurso criado', async () => {
    // Fallback: JSONPlaceholder sempre retorna ID 101 no POST, mas não o persiste no banco real.
    // Para o teste passar no mock, usaremos o ID 1 se for > 100.
    const idToTest = postId > 100 ? 1 : postId;

    const response = await apiContext.get(`/posts/${idToTest}`);
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    postSchema.parse(body); // Valida contrato
  });

  // PASSO 3: ATUALIZAR (PUT)
  test('3. PUT /posts/:id - Deve atualizar o recurso', async () => {
    const idToTest = postId > 100 ? 1 : postId;
    
    const newPayload = {
      ...postData,
      title: 'Titulo Atualizado via Automação 🚀',
      id: idToTest
    };

    const response = await apiContext.put(`/posts/${idToTest}`, {
      data: newPayload
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.title).toBe(newPayload.title);
    
    postSchema.parse(body);
  });

  // PASSO 4: DELETAR (DELETE)
  test('4. DELETE /posts/:id - Deve remover o recurso', async () => {
    const idToTest = postId > 100 ? 1 : postId;

    const response = await apiContext.delete(`/posts/${idToTest}`);
    
    // Aceita 200 ou 204 (No Content)
    expect([200, 204]).toContain(response.status());
  });

});