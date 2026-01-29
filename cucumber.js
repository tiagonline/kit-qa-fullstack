module.exports = {
  default: {
    paths: ["tests/e2e/features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["tests/e2e/steps/**/*.ts", "tests/e2e/support/**/*.ts"],
    
    // Configuração de Formatos
    format: [
      "progress-bar",                    // Barra no terminal
      "html:cucumber-report.html",       // Relatório HTML simples
      "allure-cucumberjs/reporter"       // Allure (sem o caminho aqui!)
    ],
    
    formatOptions: {
      colorsEnabled: true,
      resultsDir: "allure-results",      // <--- O caminho correto fica aqui
      dummyFormat: false                 // Workaround para alguns terminais
    }
  },
};