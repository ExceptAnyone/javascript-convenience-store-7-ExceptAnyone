//@ts-check

import { ERROR_MESSAGES } from '../constants/errorMessages.js';
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
    const processedItems = await Promise.all(
      purchaseList.map((item) => this.#processAndCreatePurchaseItem(item))
    );

    return this.#aggregatePurchaseResults(processedItems);
  }

  #aggregatePurchaseResults(processedItems) {
    return processedItems.reduce(
      (result, { purchaseItem, itemPrice }) => ({
        purchaseItems: [...result.purchaseItems, purchaseItem],
        nonPromotionTotal: this.#calculateNonPromotionTotal(
          result.nonPromotionTotal,
          purchaseItem,
          itemPrice
        ),
      }),
      { purchaseItems: [], nonPromotionTotal: 0 }
    );
  }

  #calculateNonPromotionTotal(currentTotal, purchaseItem, itemPrice) {
    return purchaseItem.hasPromotion ? currentTotal : currentTotal + itemPrice;
  }

  async #processAndCreatePurchaseItem({ name, quantity }) {
    const purchaseInfo = await this.#processSinglePurchase(name, quantity);
    return this.#createPurchaseItemResult(purchaseInfo, quantity);
  }

  #createPurchaseItemResult(purchaseInfo, quantity) {
    const itemPrice = this.#productService.calculatePrice(
      purchaseInfo.product,
      quantity
    );

    return {
      purchaseItem: this.#createPurchaseItem(purchaseInfo, itemPrice),
      itemPrice,
    };
  }

  #createPurchaseItem(purchaseInfo, itemPrice) {
    return {
      name: purchaseInfo.product.name,
      quantity: purchaseInfo.quantity,
      price: itemPrice,
      hasPromotion: purchaseInfo.product.hasPromotion(),
    };
  }

  #createPurchaseResult(purchaseItems, nonPromotionTotal) {
    const totalQuantity = purchaseItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return {
      purchaseItems,
      totalPrice: this.#totalPrice,
      totalDiscount: this.#totalDiscount,
      giftItems: this.#giftItems,
      nonPromotionTotal,
      totalQuantity,
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
    try {
      if (!this.#canApplyPromotion(product, quantity)) return quantity;
      return await this.#calculatePromotionQuantity(product, quantity);
    } catch (error) {
      return this.#handlePromotionError(error, quantity);
    }
  }

  #canApplyPromotion(product, quantity) {
    if (!product.hasPromotion()) return false;
    const promotion = this.#promotionService.findPromotion(product.promotion);
    if (!promotion) return false;
    return quantity >= promotion.buy;
  }

  async #calculatePromotionQuantity(product, quantity) {
    const promotion = this.#promotionService.findPromotion(product.promotion);
    if (this.#isFullSetQuantity(promotion, quantity)) {
      return quantity;
    }
    return await this.#determinePromotionQuantity({
      product,
      promotion,
      quantity,
    });
  }

  #isFullSetQuantity(promotion, quantity) {
    return quantity >= promotion.calculateSetSize();
  }

  async #determinePromotionQuantity(purchaseInfo) {
    const shouldAdd = await this.#promotionService.showAdditionalItemMessage(
      purchaseInfo.product.name
    );
    return this.#getFinalQuantity(shouldAdd, purchaseInfo);
  }

  #getFinalQuantity(shouldAdd, purchaseInfo) {
    if (!shouldAdd) {
      return purchaseInfo.quantity;
    }
    return purchaseInfo.promotion.calculateSetSize();
  }

  #handlePromotionError(error, quantity) {
    if (error.message === ERROR_MESSAGES.INSUFFICIENT_STOCK) {
      throw error;
    }
    return quantity;
  }

  async #validateAndProcessPurchase(product, quantity) {
    const isApplicable = await this.#promotionService.isPromotionApplicable(
      product,
      parseInt(quantity)
    );

    if (!isApplicable) throw new Error(ERROR_MESSAGES.INVALID_YES_NO);

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
    if (!this.#hasValidPromotion(product)) {
      return this.#createNonPromotionQuantities(quantity);
    }
    return this.#calculateValidPromotionQuantities(
      product,
      promotionProduct,
      quantity
    );
  }

  #hasValidPromotion(product) {
    const promotion = this.#promotionService.findPromotion(product.promotion);
    return promotion !== null;
  }

  #createNonPromotionQuantities(quantity) {
    return { promotionQuantity: 0, remainingQuantity: quantity };
  }

  #calculateValidPromotionQuantities(product, promotionProduct, quantity) {
    const promotion = this.#promotionService.findPromotion(product.promotion);
    const maxPromotionSets = Math.floor(
      promotionProduct.quantity / promotion.buy
    );
    const promotionQuantity = Math.min(
      maxPromotionSets * promotion.buy,
      quantity
    );

    return {
      promotionQuantity,
      remainingQuantity: quantity - promotionQuantity,
    };
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
    if (this.#isInsufficientStockError(error)) {
      this.#purchaseAsNormalProduct(name, quantity);
      return;
    }

    throw error;
  }

  #isInsufficientStockError(error) {
    return error.message === ERROR_MESSAGES.INSUFFICIENT_STOCK;
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

  getProductService() {
    return this.#productService;
  }
}

export default PurchaseService;
