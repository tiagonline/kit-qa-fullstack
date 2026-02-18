export class AIService {
  private readonly endpoint =
    "https://models.inference.ai.azure.com/chat/completions";
  private readonly token: string;

  constructor() {
    this.token = process.env.AZURE_AI_TOKEN || "";
    if (!this.token)
      console.warn("[AIService] ⚠️ Token AZURE_AI_TOKEN não encontrado!");
  }

  async analyzeFailure(
    errorMessage: string,
    domSnapshot: string,
  ): Promise<string> {
    console.log("[AIService] 🚀 Iniciando análise via Fetch Nativo...");

    if (!this.token) return "IA desativada: Token ausente.";

    const systemPrompt = `
      Você é uma IA de Self-Healing para automação de testes (Playwright).
      Objetivo: Consertar seletores quebrados.
      
      Regra:
      1. Analise o erro e o DOM.
      2. Retorne APENAS o seletor CSS corrigido dentro de crases. Ex: \`#novo-id\`
      3. Se não achar, responda: null
    `;

    try {
      const truncatedDom = domSnapshot.slice(0, 10000);

      console.log(`[AIService] 📤 Enviando requisição para gpt-4o-mini...`);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Erro: ${errorMessage}\n\nDOM:\n${truncatedDom}`,
            },
          ],
          model: "gpt-4o-mini", // Modelo mais rápido e leve
          temperature: 0.1,
          max_tokens: 100, // Limita resposta para ser veloz
        }),
      });

      if (!response.ok) {
        console.error(
          `[AIService] ❌ Erro API: ${response.status} - ${response.statusText}`,
        );
        const errorText = await response.text();
        console.error(`[AIService] Detalhe: ${errorText}`);
        return "Erro na API da IA";
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;

      console.log(`[AIService] 📥 Resposta recebida: ${content}`);
      return content || "Sem resposta.";
    } catch (error: any) {
      console.error(`[AIService] 💥 Exception: ${error.message}`);
      // Se for erro de certificado, avisa
      if (error.cause) console.error(`[AIService] Causa: ${error.cause}`);
      return `Erro interno: ${error.message}`;
    }
  }
}
