import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export class AIService {
  private client: any;

  constructor() {
    // Eu utilizo o token que você acabou de validar no terminal
    const token = process.env.GITHUB_AI_TOKEN || "";
    const endpoint = "https://models.inference.ai.azure.com";

    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  async analyzeFailure(errorMessage: string, domSnapshot: string): Promise<string> {
    if (!process.env.GITHUB_AI_TOKEN) return "IA desativada: Token não configurado.";

    // Eu envio um prompt de sistema rigoroso para garantir uma resposta técnica de QA
    const response = await this.client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "Você é um Especialista em QA Sênior. Analise falhas de Playwright e sugira correções baseadas no HTML fornecido." },
          { role: "user", content: `Erro: ${errorMessage}\n\nHTML Snapshot (parcial): ${domSnapshot.slice(0, 3000)}` }
        ],
        model: "gpt-4o"
      }
    });

    if (response.status !== "200") return "Falha na comunicação com GitHub Models.";
    return response.body.choices[0].message.content;
  }
}