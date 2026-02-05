import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export class AIService {
  private client: any;

  constructor() {
    const token = process.env.GITHUB_AI_TOKEN || "";
    const endpoint = "https://models.inference.ai.azure.com";

    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  async analyzeFailure(errorMessage: string, domSnapshot: string): Promise<string> {
    if (!process.env.GITHUB_AI_TOKEN) return "IA desativada: Token não configurado.";

    const systemPrompt = `
      Você é um Arquiteto de Testes de Software (QA Sênior).
      Sua tarefa é analisar erros de Playwright em testes E2E.
      
      REGRAS DE RESPOSTA:
      1. Identifique a Causa Raiz provável baseada no erro e no HTML.
      2. Se o erro for de seletor não encontrado, SUGIRA UM ÚNICO SELETOR CSS CORRIGIDO.
      3. IMPORTANTE: Envolva o seletor sugerido entre crases, exemplo: \`#id-correto\`.
      4. Seja breve e técnico.
    `;

    try {
      const truncatedDom = domSnapshot.slice(0, 20000);

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Erro: ${errorMessage}\n\nDOM Context:\n${truncatedDom}` }
          ],
          model: "gpt-4o",
          temperature: 0.1
        }
      });

      if (response.status !== "200") {
        console.error(`[AIService] Erro na API: ${response.status}`);
        return "Falha na comunicação com GitHub Models.";
      }

      // CORREÇÃO TS2339:
      // O TypeScript não infere automaticamente que 'choices' existe só pelo if acima.
      // Usamos 'as any' para acessar a propriedade com segurança após a validação do status.
      const data = response.body as any;
      
      return data.choices?.[0]?.message?.content || "Sem resposta da IA.";

    } catch (error: any) {
      console.error(`[AIService] Exception: ${error.message}`);
      return "Erro interno no serviço de IA.";
    }
  }
}