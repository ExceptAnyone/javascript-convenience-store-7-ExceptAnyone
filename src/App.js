//@ts-check

import PurchaseController from './controller/PurchaseController.js';
import outputView from './views/outputView/OutputView.js';

class App {
  #purchaseController;

  constructor() {
    this.#purchaseController = new PurchaseController();
  }

  async run() {
    await this.#initialize();
    await this.#purchaseController.handlePurchase();
  }

  async #initialize() {
    try {
      await this.#purchaseController.initialize();
    } catch (error) {
      outputView.printErrorMessage(error);
      throw error;
    }
  }
}

export default App;
