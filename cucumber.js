module.exports = {
  default: {
    // 1. Definição de Caminhos
    paths: ['tests/e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      'tests/e2e/steps/**/*.ts',
      'tests/e2e/support/hooks.ts',
      'tests/e2e/support/world.ts'
    ],
    
    // 2. Formatos de Saída (O CORAÇÃO DO PROBLEMA)
    format: [
      'progress-bar',                              // Visual limpo no console
      'html:cucumber-report.html',                 // <--- RESTAURADO: Gera o HTML que o Deploy precisa
      'json:allure-results/cucumber_report.json'   // Mantido: Gera o JSON para o Allure
    ],
    
    // 3. Opções Extras
    formatOptions: { 
      snippetInterface: 'async-await',
      colorsEnabled: true
    },
    
    // 4. Execução
    parallel: 1, 
    retry: 0
  }
};