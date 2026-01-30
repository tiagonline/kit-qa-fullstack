import { z } from "zod";

// Schema para um Post (GET /posts/1)
// .strict() garante que a API não retorne campos "lixo" não documentados
export const postSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
}).strict();

// Schema para criação (POST /posts) - A resposta geralmente contém o ID criado
export const createPostSchema = z.object({
  id: z.number(), // APIs REST costumam retornar o ID criado (às vezes 101 no JSONPlaceholder)
  title: z.string(),
  body: z.string(),
  userId: z.number(),
});