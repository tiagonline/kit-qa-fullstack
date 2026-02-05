import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export class AIService {
  private client: any;
  private readonly endpoint = "https://models.inference.ai.azure.com";
  private readonly token: string;

  constructor() {
    // Apenas guardamos o token, NÃO iniciamos o cliente ainda (Lazy)
    this.token = process.env.GITHUB_AI_TOKEN || "";
    this.client = null;
  }

  private getClient() {
    // Padrão Singleton Lazy: Só cria o cliente se ele não existir e se tiver token
    if (!this.client) {
      if (!this.token) {
        return null; // Sem token, sem cliente
      }
      try {
        this.client = ModelClient(this.endpoint, new AzureKeyCredential(this.token));
      } catch (e) {
        console.error("[AIService] Erro ao iniciar credenciais Azure:", e.message);
        return null;
      }
    }
    return this.client;
  }

  async analyzeFailure(errorMessage: string, domSnapshot: string): Promise<string> {
    // Verifica se temos token antes de tudo
    if (!this.token) return "IA desativada: Token não configurado.";

    const client = this.getClient();
    if (!client) return "IA indisponível: Falha na inicialização do cliente.";

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

      const response = await client.path("/chat/completions").post({
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

      const data = response.body as any;
      return data.choices?.[0]?.message?.content || "Sem resposta da IA.";

    } catch (error: any) {
      console.error(`[AIService] Exception: ${error.message}`);
      return "Erro interno no serviço de IA.";
    }
  }
}