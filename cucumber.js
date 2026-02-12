module.exports = {
  default: {
    paths: ["tests/e2e/features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["tests/e2e/steps/**/*.ts", "tests/e2e/support/**/*.ts"],
    
    format: [
      "progress-bar",                    // 1. Visual no Terminal
      "html:cucumber-report.html",       // 2. Relatório HTML Simples
      "allure-cucumberjs/reporter"       // 3. Relatório Rico Allure
    ],
    
    formatOptions: {
      resultsDir: "allure-results",      // Garante que o Allure salve na pasta certa
      colorsEnabled: true,
      dummyFormat: false
    }
  },
};