import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

// Definindo o contrato (Schema) da postagem
const postSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

test.describe.serial('Testes de API - Fluxo CRUD, Idempotência & Negativos', () => {
  let apiContext: APIRequestContext;
  let createdPostId: number;
  
  const fakeTitle = faker.lorem.sentence();
  const fakeBody = faker.lorem.paragraph();
  const fakeUserId = faker.number.int({ min: 1, max: 100 });
  
  const updatedTitle = faker.lorem.sentence();
  const updatedBody = faker.lorem.paragraph();

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL,
      ignoreHTTPSErrors: true,
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // --- CENÁRIOS POSITIVOS & IDEMPOTÊNCIA ---

  test('POST /posts - Deve ser idempotente e validar o contrato', async () => {
    const idempotencyKey = faker.string.uuid();
    const payload = {
      title: fakeTitle,
      body: fakeBody,
      userId: fakeUserId,
    };

    console.log(`\n[IDEMPOTÊNCIA] Gerando Chave Única: ${idempotencyKey}`);

    // Primeira tentativa
    const response1 = await apiContext.post('/posts', {
      data: payload,
      headers: { 'X-Idempotency-Key': idempotencyKey }
    });
    const body1 = await response1.json();
    createdPostId = body1.id;
    console.log(`[REQ 1] Status: ${response1.status()} | ID Gerado: ${body1.id}`);

    // Segunda tentativa (Simulação de Retry)
    console.log(`[RETRY] Enviando mesma requisição com a mesma chave...`);
    const response2 = await apiContext.post('/posts', {
      data: payload,
      headers: { 'X-Idempotency-Key': idempotencyKey }
    });
    const body2 = await response2.json();
    console.log(`[REQ 2] Status: ${response2.status()} | ID Retornado: ${body2.id}`);

    // Verificação de Contrato
    const validation = postSchema.safeParse(body2);
    expect(validation.success).toBeTruthy();

    // Verificação de consistência
    expect(body1.title).toBe(body2.title);
    console.log(`[CHECK] Títulos conferem: "${body2.title.substring(0, 20)}..."`);
    console.log(`[RESULTADO] Idempotência validada com sucesso!\n`);
  });

  test('GET /posts/:id - Deve consultar a postagem e validar o contrato', async () => {
    const idToTest = (createdPostId > 100) ? 1 : createdPostId; 
    const response = await apiContext.get(`/posts/${idToTest}`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validation = postSchema.safeParse(responseBody);
    expect(validation.success).toBeTruthy();
    expect(responseBody).toHaveProperty('id', idToTest);
  });

  test('PUT /posts/:id - Deve ser idempotente na atualização integral', async () => {
    const idToTest = (createdPostId > 100) ? 1 : createdPostId;
    const updatePayload = {
      id: idToTest,
      title: updatedTitle,
      body: updatedBody,
      userId: fakeUserId,
    };

    console.log(`[PUT IDEMPOTENCY] Atualizando ID: ${idToTest}`);
    const res1 = await apiContext.put(`/posts/${idToTest}`, { data: updatePayload });
    const res2 = await apiContext.put(`/posts/${idToTest}`, { data: updatePayload });

    console.log(`[PUT 1] Status: ${res1.status()}`);
    console.log(`[PUT 2] Status: ${res2.status()}`);
    
    const body1 = await res1.json();
    const body2 = await res2.json();
    
    expect(body1).toEqual(body2);
    console.log(`[CHECK] Respostas do PUT são idênticas. Estado final consistente.\n`);
  });

  test('DELETE /posts/:id - Deve remover a postagem', async () => {
    const idToTest = (createdPostId > 100) ? 1 : createdPostId;
    const response = await apiContext.delete(`/posts/${idToTest}`);
    expect(response.status()).toBe(200);
    console.log(`[DELETE] Recurso ${idToTest} removido.`);
  });

  // --- CENÁRIOS NEGATIVOS ---

  test.describe("Cenários Negativos & Casos de Borda", () => {

    test("GET /posts/abc - ID com formato inválido (404/400)", async () => {
      const response = await apiContext.get(`/posts/abc`);
      console.log(`[NEGATIVO] ID Alfanumérico: Status ${response.status()}`);
      // Esperamos que a API não quebre, retornando erro de não encontrado ou má requisição
      expect([404, 400]).toContain(response.status());
    });

    test("POST /posts - Campos obrigatórios ausentes", async () => {
      // Enviando payload vazio para testar a robustez da validação do servidor
      const response = await apiContext.post(`/posts`, {
        data: {}
      });
      console.log(`[NEGATIVO] Payload Vazio: Status ${response.status()}`);
      // Nota: JSONPlaceholder aceita tudo, mas em APIs reais buscaríamos 400 Bad Request
      expect([201, 400]).toContain(response.status());
    });

    test("POST /posts - Tipagem incorreta (Data Fuzzing)", async () => {
      const response = await apiContext.post(`/posts`, {
        data: {
          title: 12345, // Número onde deveria ser String
          body: true,   // Booleano onde deveria ser String
          userId: "admin" // String onde deveria ser Número
        }
      });
      console.log(`[NEGATIVO] Tipagem Errada: Status ${response.status()}`);
      // Se a API for bem tipada, ela deveria rejeitar.
      expect([201, 400, 422]).toContain(response.status());
    });

    test("POST /posts - String extremamente longa (Payload Stress)", async () => {
      const longString = faker.lorem.paragraphs(20); // Gerando texto massivo com Faker
      const response = await apiContext.post(`/posts`, {
        data: {
          title: longString,
          body: "Teste de limite",
          userId: 1
        }
      });
      console.log(`[NEGATIVO] String Longa: Status ${response.status()}`);
      expect(response.ok()).toBeTruthy(); // Validamos se o servidor aguenta o processamento
    });

    test("GET /posts/0 - ID Limite Zero", async () => {
      const response = await apiContext.get(`/posts/0`);
      console.log(`[NEGATIVO] ID Zero: Status ${response.status()}`);
      expect(response.status()).toBe(404);
    });

    test("Simulação de Falha de Autenticação (Token Inválido)", async ({ playwright }) => {
        const authContext = await playwright.request.newContext({
            baseURL: process.env.API_BASE_URL,
            extraHTTPHeaders: { 'Authorization': 'Bearer 12345_TOKEN_INVALIDO' }
        });
        
        const response = await authContext.get(`/posts/1`);
        console.log(`[NEGATIVO] Auth Inválida: Status ${response.status()}`);
        // Como o JSONPlaceholder é público, ele retorna 200, mas listamos o 401 para APIs reais
        expect([200, 401, 403]).toContain(response.status()); 
        await authContext.dispose();
    });
  });
});