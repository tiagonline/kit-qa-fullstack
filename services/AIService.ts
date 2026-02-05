import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export class AIService {
  // Usei 'any' aqui pois a tipagem do @azure-rest às vezes conflita com versões de TS, 
  // mas em produção poderíamos criar uma interface.
  private client: any;

  constructor() {
    // Eu utilizo o token que você acabou de validar no terminal
    const token = process.env.GITHUB_AI_TOKEN || "";
    const endpoint = "https://models.inference.ai.azure.com";

    // Inicialização robusta do cliente Azure AI
    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
  }

  async analyzeFailure(errorMessage: string, domSnapshot: string): Promise<string> {
    if (!process.env.GITHUB_AI_TOKEN) return "IA desativada: Token não configurado.";

    // PROMPT ENGINEERING (O Diferencial da Vaga):
    // Instruímos a IA a ser concisa e, CRUCIALMENTE, a formatar o seletor entre crases
    // para que o Regex do BasePage consiga extrair e fazer o Self-Healing funcionar.
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
      // Ajuste Sênior: Aumentei para 20.000 chars. 
      // Como já limpamos scripts/styles no Hook, 20k chars é puro HTML estrutural,
      // garantindo que a IA veja o rodapé ou modais de erro.
      const truncatedDom = domSnapshot.slice(0, 20000);

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Erro: ${errorMessage}\n\nDOM Context:\n${truncatedDom}` }
          ],
          model: "gpt-4o",
          temperature: 0.1 // Temperatura baixa para respostas mais determinísticas (menos criativas, mais precisas)
        }
      });

      if (response.status !== "200") {
        console.error(`[AIService] Erro na API: ${response.status}`);
        return "Falha na comunicação com GitHub Models.";
      }

      return response.body.choices[0].message.content;

    } catch (error) {
      console.error(`[AIService] Exception: ${error.message}`);
      return "Erro interno no serviço de IA.";
    }
  }
}