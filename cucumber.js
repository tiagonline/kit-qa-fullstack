module.exports = {
  default: {
    // Aponta para os arquivos corretos
    paths: ['tests/e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      'tests/e2e/steps/**/*.ts',
      'tests/e2e/support/hooks.ts',
      'tests/e2e/support/world.ts'
    ],
    // Formatação segura para CI
    format: [
      'progress-bar', // Visual limpo no terminal
      'json:allure-results/cucumber_report.json' // Gera JSON para o Allure processar depois
    ],
    formatOptions: { 
      snippetInterface: 'async-await' 
    },
    // Paralelismo (Cuidado em CI com poucos recursos)
    parallel: 1, 
    retry: 0
  }
};