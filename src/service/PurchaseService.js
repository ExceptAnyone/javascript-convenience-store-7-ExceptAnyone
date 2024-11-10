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
      const { purchaseItems, nonPromotionTotal } =
        await this.#processPurchaseItems(purchaseList);

      return this.#createPurchaseResult(purchaseItems, nonPromotionTotal);
    } catch (error) {
      throw error;
    }
  }

  async #processPurchaseItems(purchaseList) {
    const purchaseItems = [];
    let nonPromotionTotal = 0;

    for (const purchaseItem of purchaseList) {
      const { purchaseItem: processedItem, itemPrice } =
        await this.#processAndCreatePurchaseItem(purchaseItem);

      purchaseItems.push(processedItem);
      if (!processedItem.hasPromotion) nonPromotionTotal += itemPrice;
    }

    return { purchaseItems, nonPromotionTotal };
  }

  async #processAndCreatePurchaseItem({ name, quantity }) {
    const { product, quantity: updatedQuantity } =
      await this.#processSinglePurchase(name, quantity);

    const itemPrice = this.#productService.calculatePrice(product, quantity);

    const purchaseItem = {
      name,
      quantity: updatedQuantity,
      price: itemPrice,
      hasPromotion: product.hasPromotion(),
    };

    return { purchaseItem, itemPrice };
  }

  #createPurchaseResult(purchaseItems, nonPromotionTotal) {
    return {
      purchaseItems,
      totalPrice: this.#totalPrice,
      totalDiscount: this.#totalDiscount,
      giftItems: this.#giftItems,
      nonPromotionTotal,
    };
  }

  async showProducts() {
    try {
      this.#productService.showProducts();
    } catch (error) {
      throw error;
    }
  }

  async #processSinglePurchase(name, quantity) {
    const product = this.#findAndValidateProduct(name);
    const updatedQuantity = await this.#handlePromotionQuantity(
      product,
      quantity
    );
    await this.#validateAndProcessPurchase(product, updatedQuantity);

    return { product, quantity: updatedQuantity };
  }

  #findAndValidateProduct(name) {
    const product = this.#productService.findProduct(name);
    if (!product) {
      throw new Error('[ERROR] 존재하지 않는 상품입니다.');
    }
    return product;
  }

  async #handlePromotionQuantity(product, quantity) {
    if (!product.hasPromotion()) return quantity;

    const promotion = this.#promotionService.findPromotion(product.promotion);
    if (quantity >= promotion.calculateSetSize()) return quantity;

    const shouldAdd = await this.#promotionService.showAdditionalItemMessage(
      product.name
    );
    return shouldAdd ? promotion.calculateSetSize() : quantity;
  }

  async #validateAndProcessPurchase(product, quantity) {
    const isApplicable = await this.#promotionService.isPromotionApplicable(
      product,
      parseInt(quantity)
    );

    if (!isApplicable) throw new Error('구매 취소');

    this.#calculatePurchaseAmounts(product, quantity);
    await this.#tryPromotionPurchase(product, quantity);
  }

  async #tryPromotionPurchase(product, quantity) {
    try {
      const promotionProduct = this.#findPromotionProduct(product.name);
      if (!promotionProduct) {
        return this.#purchaseAsNormalProduct(product.name, quantity);
      }

      await this.#handlePromotionPurchase(product, promotionProduct, quantity);
    } catch (error) {
      this.#handlePurchaseError(error, product.name, quantity);
    }
  }

  #findPromotionProduct(name) {
    return this.#productService.findPromotionProduct(name);
  }

  #purchaseAsNormalProduct(name, quantity) {
    this.#productService.updateStock(name, quantity, false);
  }

  async #handlePromotionPurchase(product, promotionProduct, quantity) {
    const { promotionQuantity, remainingQuantity } =
      this.#calculatePromotionQuantities(product, promotionProduct, quantity);

    await this.#updatePromotionStock(
      product.name,
      promotionQuantity,
      remainingQuantity
    );
  }

  #calculatePromotionQuantities(product, promotionProduct, quantity) {
    const promotion = this.#promotionService.findPromotion(product.promotion);
    const maxPromotionSets = Math.floor(
      promotionProduct.quantity / promotion.buy
    );
    const promotionQuantity = Math.min(
      maxPromotionSets * promotion.buy,
      quantity
    );
    const remainingQuantity = quantity - promotionQuantity;

    return { promotionQuantity, remainingQuantity };
  }

  async #updatePromotionStock(name, promotionQuantity, remainingQuantity) {
    if (promotionQuantity > 0) {
      this.#productService.updateStock(name, promotionQuantity, true);
    }
    if (remainingQuantity > 0) {
      this.#productService.updateStock(name, remainingQuantity, false);
    }
  }

  #handlePurchaseError(error, name, quantity) {
    if (error.message === '프로모션 재고 부족') {
      this.#purchaseAsNormalProduct(name, quantity);
    } else {
      throw error;
    }
  }

  #calculatePurchaseAmounts(product, quantity) {
    const { basePrice, promotionDiscount } = this.#calculatePrices(
      product,
      quantity
    );
    const giftQuantity = this.#calculateGiftQuantity(product, quantity);

    this.#updateTotals(basePrice, promotionDiscount);
    this.#updateGiftItems(product.name, giftQuantity);
  }

  #calculatePrices(product, quantity) {
    const basePrice = this.#productService.calculatePrice(product, quantity);
    const promotionDiscount = this.#promotionService.calculateDiscount(
      product,
      quantity
    );

    return { basePrice, promotionDiscount };
  }

  #calculateGiftQuantity(product, quantity) {
    const promotionProduct = this.#productService.findPromotionProduct(
      product.name
    );
    return this.#promotionService.calculateGiftQuantity(
      promotionProduct || product,
      quantity
    );
  }

  #updateTotals(basePrice, promotionDiscount) {
    this.#totalPrice += basePrice;
    this.#totalDiscount += promotionDiscount;
  }

  #updateGiftItems(productName, giftQuantity) {
    if (giftQuantity > 0) {
      const currentGiftQuantity = this.#giftItems.get(productName) || 0;
      this.#giftItems.set(productName, currentGiftQuantity + giftQuantity);
    }
  }
}

export default PurchaseService;
