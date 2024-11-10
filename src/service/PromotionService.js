//@ts-check

import fileReader from '../fileReader/fileReader.js';
import Promotion from '../model/Promotion.js';
import inputView from '../views/inputView/InputView.js';

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
    return this.#promotions.find(
      (p) => p.name === promotionName && p.isValid()
    );
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

    // 프로모션 재고 확인

    const maxPromotionQuantity = Math.min(product.quantity, quantity);

    // 프로모션 세트 수 계산
    const sets = promotion.calculatePromotionSets(maxPromotionQuantity);

    console.log('maxPromotionQuantity', maxPromotionQuantity);
    console.log('sets', sets);
    console.log('sets * promotion.get', sets * promotion.get);

    return sets * promotion.get;
  }

  async isPromotionApplicable(product, quantity) {
    if (!product.hasPromotion()) {
      return true;
    }

    const promotion = this.findPromotion(product.promotion);
    if (!promotion || !promotion.isValid()) {
      return false;
    }

    // 프로모션 재고 계산
    const promotionProduct = product;
    const promotionQuantity = promotionProduct.quantity;

    // 프로모션 적용 가능한 세트 수 계산 (2+1의 경우 2개가 1세트)
    const setsAvailable = Math.floor(promotionQuantity / promotion.buy);
    const maxPromotionItems = setsAvailable * promotion.buy;

    // 프로모션 적용 불가능한 수량 계산
    const nonPromotionItems = quantity - maxPromotionItems;

    if (nonPromotionItems > 0) {
      return await this.#confirmPartialPromotion(
        product.name,
        nonPromotionItems
      );
    }

    return true;
  }

  async showAdditionalItemMessage(productName) {
    const message = `현재 ${productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`;
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
