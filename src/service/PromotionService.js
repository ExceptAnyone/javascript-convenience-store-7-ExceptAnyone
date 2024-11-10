//@ts-check

import fileReader from '../fileReader/fileReader.js';
import Promotion from '../model/Promotion.js';
import inputView from '../views/inputView/InputView.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class PromotionService {
  #promotions;

  constructor() {
    this.#promotions = [];
  }

  async initialize() {
    const promotionsData = await fileReader.readPromotionsFile();
    this.#promotions = promotionsData.map(
      (data) =>
        new Promotion(
          data.name,
          data.buy,
          data.get,
          data.start_date,
          data.end_date
        )
    );
  }

  findPromotion(promotionName) {
    const promotion = this.#promotions.find((p) => p.name === promotionName);
    if (!promotion) return null;

    if (!promotion.isValid()) {
      return null;
    }

    return promotion;
  }

  calculateDiscount(product, quantity) {
    const promotion = this.findPromotion(product.promotion);
    if (!promotion) return 0;

    // 프로모션 재고를 기준으로 계산
    const maxPromotionQuantity = Math.min(product.quantity, quantity);
    const sets = promotion.calculatePromotionSets(maxPromotionQuantity);

    return sets * promotion.get * product.price;
  }

  calculateGiftQuantity(product, quantity) {
    const promotion = this.findPromotion(product.promotion);
    if (!promotion) return 0;

    const maxPromotionQuantity = Math.min(product.quantity, quantity);

    const sets = promotion.calculatePromotionSets(maxPromotionQuantity);

    return sets * promotion.get;
  }

  async isPromotionApplicable(product, quantity) {
    try {
      if (!this.#isPromotionValid(product)) return true;

      const promotionDetails = this.#calculatePromotionDetails(
        product,
        quantity
      );
      return await this.#checkPromotionApplicability(product, promotionDetails);
    } catch (error) {
      if (error.message === ERROR_MESSAGES.INVALID_PROMOTION_PERIOD) {
        throw error;
      }
      return true;
    }
  }

  #isPromotionValid(product) {
    if (!product.hasPromotion()) return false;

    const promotion = this.findPromotion(product.promotion);
    if (!promotion) return false;

    return true;
  }

  #calculatePromotionDetails(product, quantity) {
    const promotionQuantity = product.quantity;
    const promotion = this.findPromotion(product.promotion);

    const setsAvailable = Math.floor(promotionQuantity / promotion.buy);
    const maxPromotionItems = setsAvailable * promotion.buy;
    const nonPromotionItems = quantity - maxPromotionItems;

    return { nonPromotionItems };
  }

  async #checkPromotionApplicability(product, { nonPromotionItems }) {
    if (nonPromotionItems <= 0) return true;

    return await this.#confirmPartialPromotion(product.name, nonPromotionItems);
  }

  async showAdditionalItemMessage(productName) {
    const message = `\n현재 ${productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`;
    const response = await inputView.readUserInput(message);
    return response.toUpperCase() === 'Y';
  }

  async #confirmPartialPromotion(productName, nonPromotionItems) {
    const message = `현재 ${productName} ${nonPromotionItems}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`;
    const response = await inputView.readUserInput(message);
    return response.toUpperCase() === 'Y';
  }
}

export default PromotionService;
