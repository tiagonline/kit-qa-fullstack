module.exports = {
  default: {
    paths: ["tests/e2e/features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["tests/e2e/steps/**/*.ts", "tests/e2e/support/**/*.ts"],
    
    format: [
      "progress-bar",                    // 1. Barra de progresso no terminal
      "html:cucumber-report.html",       // 2. Gera o HTML simples (para o deploy não quebrar)
      "allure-cucumberjs/reporter"       // 3. ESTE É O CARA: Gera os dados das Suítes para o Allure
    ],
    
    formatOptions: {
      resultsDir: "allure-results",      // Pasta onde o json do Allure é salvo
      colorsEnabled: true,
      dummyFormat: false
    }
  },
};