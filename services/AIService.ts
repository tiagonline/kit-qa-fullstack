import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export class AIService {
  private client: any = null;
  private readonly endpoint = "https://models.inference.ai.azure.com";
  private readonly token: string;

  constructor() {
    this.token = process.env.GITHUB_AI_TOKEN || "";
  }

  private getClient() {
    if (!this.client && this.token) {
      try {
        this.client = ModelClient(this.endpoint, new AzureKeyCredential(this.token));
      } catch (e: any) {
        console.error(`[AIService] Erro ao inicializar cliente: ${e.message}`);
        return null;
      }
    }
    return this.client;
  }

  async analyzeFailure(errorMessage: string, domSnapshot: string): Promise<string> {
    if (!this.token) return "IA desativada: Token não configurado.";

    const client = this.getClient();
    if (!client) return "IA indisponível: Falha na inicialização.";

    // 🎯 PROMPT BLINDADO: Exige formato estrito
    const systemPrompt = `
      Você é um especialista em Auto-Healing para Playwright (QA).
      Analise o erro e o DOM fornecido.
      
      SEU OBJETIVO: Encontrar o seletor CSS correto para corrigir o teste.
      
      REGRAS CRÍTICAS DE RESPOSTA:
      1. Se encontrar o elemento, responda APENAS o seletor dentro de crases. Exemplo: \`#login-button\`
      2. NÃO explique nada. NÃO dê contexto. APENAS O SELETOR.
      3. Se não encontrar, responda: \`null\`
    `;

    try {
      // Cortamos o DOM para não estourar o limite de tokens e focar no essencial
      const truncatedDom = domSnapshot.slice(0, 15000);

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Erro: ${errorMessage}\n\nDOM:\n${truncatedDom}` }
          ],
          model: "gpt-4o",
          temperature: 0.1 // Temperatura baixa = Mais precisão, menos criatividade
        }
      });

      if (response.status !== "200") {
        console.error(`[AIService] Erro na API: ${response.status}`);
        return "Erro na API da IA";
      }

      const data = response.body as any;
      return data.choices?.[0]?.message?.content || "Sem resposta.";

    } catch (error: any) {
      console.error(`[AIService] Exception: ${error.message}`);
      return "Erro interno no serviço de IA.";
    }
  }
}