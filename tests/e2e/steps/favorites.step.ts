import { When, Then } from '@cucumber/cucumber';
import { PageManager } from '../../../pages/PageManager';

When('favoritado o produto {string}', async function (nomeProduto) {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  await this.pageManager.inventory.favoritarProduto(nomeProduto);
});

Then('o ícone de favorito deve estar ativo para o produto {string}', async function (nomeProduto) {
  await this.pageManager.inventory.validarIconeFavoritoAtivo(nomeProduto);
});