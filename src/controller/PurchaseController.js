//@ts-check

import { GAME_MESSAGES } from '../constants/gameMessages.js';
import PurchaseService from '../service/PurchaseService.js';
import inputView from '../views/inputView/InputView.js';
import outputView from '../views/outputView/OutputView.js';
import MembershipService from '../service/MembershipService.js';

class PurchaseController {
  #purchaseService;
  #membershipService;

  constructor() {
    this.#purchaseService = new PurchaseService();
    this.#membershipService = new MembershipService();
  }

  async initialize() {
    try {
      await this.#purchaseService.initialize();
      await this.#membershipService.initialize();
    } catch (error) {
      throw error;
    }
  }

  async handlePurchase() {
    try {
      await this.#processPurchaseLoop();
    } catch (error) {
      return await this.#handlePurchaseError(error);
    }
  }

  async #processPurchaseLoop() {
    let continueShopping = true;
    while (continueShopping) {
      const purchaseResult = await this.#processCurrentPurchase();
      await this.#handleMembershipAndReceipt(purchaseResult);
      continueShopping = await this.#handleContinueShopping();
    }
  }

  async #processCurrentPurchase() {
    await this.#showProducts();
    const purchaseInput = await this.#getPurchaseInput();
    const purchaseList = this.#parsePurchaseInput(purchaseInput);
    return await this.#purchaseService.processPurchase(purchaseList);
  }

  async #handleMembershipAndReceipt(purchaseResult) {
    const membershipDiscount = await this.#calculateMembershipDiscount(
      purchaseResult.nonPromotionTotal
    );
    purchaseResult.membershipDiscount = membershipDiscount;
    await this.#showReceipt(purchaseResult);
  }

  async #calculateMembershipDiscount(nonPromotionTotal) {
    const useMembership = await this.#askForMembership();
    return useMembership
      ? this.#membershipService.calculateDiscount(nonPromotionTotal)
      : 0;
  }

  async #handlePurchaseError(error) {
    outputView.printErrorMessage(error);
    return await this.handlePurchase();
  }

  async #showProducts() {
    await this.#purchaseService.showProducts();
  }

  async #getPurchaseInput() {
    return await inputView.readUserInput(GAME_MESSAGES.ENTER_PRODUCT_INFO);
  }

  #parsePurchaseInput(input) {
    try {
      return input.match(/\[([^\]]+)\]/g).map((item) => {
        const [name, quantity] = item.slice(1, -1).split('-');
        this.#validatePurchaseInput(name, quantity);
        return { name, quantity: parseInt(quantity) };
      });
    } catch (error) {
      throw new Error('[ERROR] 올바르지 않은 형식으로 입력했습니다.');
    }
  }

  #validatePurchaseInput(name, quantity) {
    if (!name || !quantity) {
      throw new Error('[ERROR] 올바르지 않은 형식으로 입력했습니다.');
    }
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('[ERROR] 상품 수량은 1개 이상이어야 합니다.');
    }
  }

  async #askForMembership() {
    const response = await inputView.readUserInput(
      GAME_MESSAGES.ASK_MEMBERSHIP
    );
    return response.toUpperCase() === 'Y';
  }

  async #handleContinueShopping() {
    const response = await inputView.readUserInput(
      GAME_MESSAGES.ASK_CONTINUE_SHOPPING
    );
    return response.toUpperCase() === 'Y';
  }

  async #showReceipt(purchaseResult) {
    outputView.printReceipt(purchaseResult);
  }
}

export default PurchaseController;
