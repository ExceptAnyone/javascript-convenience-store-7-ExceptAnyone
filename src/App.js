//@ts-check

import { GAME_MESSAGES } from './constants/gameMessages.js';
import fileReader from './fileReader/fileReader.js';
import Products from './model/Products.js';
import inputView from './views/inputView/InputView.js';
import outputView from './views/outputView/OutputView.js';

class App {
  #products;
  #promotions;
  #totalPrize;

  constructor() {
    this.#totalPrize = 0;
  }

  async run() {
    this.#introduce();
    await this.#initialize();
    await this.#products.showProducts();
    await this.purchaseProducts();
  }

  async purchaseProducts() {
    try {
      const products = await inputView.readUserInput(
        GAME_MESSAGES.ENTER_PRODUCT_INFO
      );
      const purchaseList = this.#parsePurchaseInput(products);
      purchaseList.forEach(({ name, quantity }) => {
        const product = this.#products.findProduct(name, quantity);
        this.#totalPrize += this.#products.calculatePrice(product, quantity);
      });

      outputView.printMessage(`내실 돈${this.#totalPrize}`);
    } catch (error) {
      outputView.printErrorMessage(error);
      await this.purchaseProducts();
    }
  }

  #parsePurchaseInput(input) {
    const pattern = /\[(.*?)\]/g;
    const matches = input.match(pattern);

    if (!matches) {
      throw new Error(
        '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.'
      );
    }

    return matches.map((match) => {
      const [name, quantity] = match.slice(1, -1).split('-');
      return { name, quantity };
    });
  }

  async #initialize() {
    try {
      const productsData = await fileReader.readProductsFile();
      this.#products = new Products(productsData);
      this.#promotions = await fileReader.readPromotionsFile();
    } catch (error) {
      outputView.printErrorMessage(error);
      throw error;
    }
  }

  async #introduce() {
    outputView.printMessage(GAME_MESSAGES.INTRODUCE_PRODUCT_LIST);
  }
}

export default App;
