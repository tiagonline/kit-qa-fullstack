import { When, Then } from '@cucumber/cucumber';
import { ICustomWorld } from '../support/world';

When('favoritado o produto {string}', async function (this: ICustomWorld, nomeProduto: string) {
  // O PageManager já existe no 'this' graças ao hook e ao CustomWorld
  await this.pageManager.inventory.favoritarProduto(nomeProduto);
});

Then('o ícone de favorito deve estar ativo para o produto {string}', async function (this: ICustomWorld, nomeProduto: string) {
  await this.pageManager.inventory.validarIconeFavoritoAtivo(nomeProduto);
});