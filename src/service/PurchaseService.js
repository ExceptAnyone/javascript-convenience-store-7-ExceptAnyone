//@ts-check

import inputView from '../views/inputView/InputView.js';
import ProductService from './ProductService.js';
import PromotionService from './PromotionService.js';

class PurchaseService {
  #productService;
  #promotionService;
  #totalPrice;
  #totalDiscount;
  #giftItems;

  constructor() {
    this.#productService = new ProductService();
    this.#promotionService = new PromotionService();
    this.#resetPurchaseData();
  }

  #resetPurchaseData() {
    this.#totalPrice = 0;
    this.#totalDiscount = 0;
    this.#giftItems = new Map();
  }

  async initialize() {
    try {
      await this.#productService.initialize();
      await this.#promotionService.initialize();
    } catch (error) {
      throw error;
    }
  }

  async processPurchase(purchaseList) {
    try {
      this.#resetPurchaseData();
      const purchaseItems = [];
      let nonPromotionTotal = 0;

      for (const { name, quantity } of purchaseList) {
        const product = await this.#processSinglePurchase(name, quantity);
        const itemPrice = product.price * quantity;

        purchaseItems.push({
          name,
          quantity,
          price: itemPrice,
          hasPromotion: product.hasPromotion(),
        });

        if (!product.hasPromotion()) {
          nonPromotionTotal += itemPrice;
        }
      }

      return {
        purchaseItems,
        totalPrice: this.#totalPrice,
        totalDiscount: this.#totalDiscount,
        giftItems: this.#giftItems,
        nonPromotionTotal,
      };
    } catch (error) {
      throw error;
    }
  }

  async showProducts() {
    try {
      this.#productService.showProducts();
    } catch (error) {
      throw error;
    }
  }

  async #processSinglePurchase(name, quantity) {
    const product = this.#productService.findProduct(name);
    if (!product) {
      throw new Error('[ERROR] 존재하지 않는 상품입니다.');
    }

    if (product.hasPromotion()) {
      const promotion = this.#promotionService.findPromotion(product.promotion);
      if (quantity < promotion.buy) {
        const shouldAdd =
          await this.#promotionService.showAdditionalItemMessage(name);
        if (shouldAdd) {
          quantity = promotion.buy;
        }
      }
    }

    const isApplicable = await this.#promotionService.isPromotionApplicable(
      product,
      parseInt(quantity)
    );
    if (!isApplicable) {
      const shouldContinue = await this.#confirmNonPromotionalPurchase(
        name,
        quantity
      );
      if (!shouldContinue) {
        throw new Error('구매 취소');
      }
    }

    await this.#updateStockAndCalculate(product, parseInt(quantity));
    return product;
  }

  async #updateStockAndCalculate(product, quantity) {
    try {
      // 증정 수량 먼저 계산
      const promotionProduct = this.#productService.findPromotionProduct(
        product.name
      );
      const giftQuantity = this.#promotionService.calculateGiftQuantity(
        promotionProduct || product,
        quantity
      );

      // 재고 차감
      if (product.hasPromotion()) {
        await this.#tryPromotionPurchase(product, quantity);
      } else {
        this.#productService.updateStock(product.name, quantity, false);
      }

      // 나머지 계산
      const basePrice = this.#productService.calculatePrice(product, quantity);
      const promotionDiscount = this.#promotionService.calculateDiscount(
        product,
        quantity
      );

      this.#totalPrice += basePrice;
      this.#totalDiscount += promotionDiscount;

      if (giftQuantity > 0) {
        this.#giftItems.set(
          product.name,
          (this.#giftItems.get(product.name) || 0) + giftQuantity
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async #tryPromotionPurchase(product, quantity) {
    try {
      this.#productService.updateStock(product.name, quantity, true);
    } catch (error) {
      if (error.message === '프로모션 재고 부족') {
        // 일반 상품으로 시도
        this.#productService.updateStock(product.name, quantity, false);
      } else {
        throw error;
      }
    }
  }

  #calculatePurchaseAmounts(product, quantity) {
    const basePrice = this.#productService.calculatePrice(product, quantity);
    const promotionDiscount = this.#promotionService.calculateDiscount(
      product,
      quantity
    );

    // 프로모션 상품의 재고를 기준으로 증정 수량 계산
    const promotionProduct = this.#productService.findPromotionProduct(
      product.name
    );
    const giftQuantity = this.#promotionService.calculateGiftQuantity(
      promotionProduct || product,
      quantity
    );

    this.#totalPrice += basePrice;
    this.#totalDiscount += promotionDiscount;

    if (giftQuantity > 0) {
      this.#giftItems.set(
        product.name,
        (this.#giftItems.get(product.name) || 0) + giftQuantity
      );
    }
  }

  async #confirmNonPromotionalPurchase(name, quantity) {
    const message = `현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`;
    const response = await inputView.readUserInput(message);
    return response.toUpperCase() === 'Y';
  }
}

export default PurchaseService;