//@ts-check

import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class Validator {
  static validatePurchaseInput(input, productService) {
    this.#validateEmptyInput(input);
    const purchaseItems = this.#parsePurchaseItems(input);
    purchaseItems.forEach((item) =>
      this.#validatePurchaseItem(item, productService)
    );
    return purchaseItems;
  }

  static #validateEmptyInput(input) {
    if (!input || !input.trim()) {
      throw new Error(ERROR_MESSAGES.EMPTY_INPUT);
    }
  }

  static #parsePurchaseItems(input) {
    const matches = this.#extractMatches(input);
    return this.#parseMatches(matches);
  }

  static #extractMatches(input) {
    const matches = input.match(/\[([^\]]+)\]/g);
    if (!matches) {
      throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
    }
    return matches;
  }

  static #parseMatches(matches) {
    return matches.map((item) => {
      const [name, quantity] = this.#splitNameAndQuantity(item);
      return { name, quantity };
    });
  }

  static #splitNameAndQuantity(item) {
    const [name, quantity] = item.slice(1, -1).split('-');
    if (!name || !quantity) {
      throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
    }
    return [name, quantity];
  }

  static #validatePurchaseItem({ name, quantity }, productService) {
    this.#validateName(name);
    this.#validateQuantity(quantity);
    this.#validateStock(name, parseInt(quantity), productService);
  }

  static #validateName(name) {
    if (!name || !name.trim()) {
      throw new Error(ERROR_MESSAGES.EMPTY_NAME);
    }
  }

  static #validateQuantity(quantity) {
    if (!quantity) {
      throw new Error(ERROR_MESSAGES.EMPTY_QUANTITY);
    }
    this.#validateQuantityFormat(quantity);
  }

  static #validateQuantityFormat(quantity) {
    const parsedQuantity = parseInt(quantity);
    this.#validateInteger(parsedQuantity, quantity);
    this.#validatePositive(parsedQuantity);
  }

  static #validateInteger(parsedQuantity, originalQuantity) {
    if (isNaN(parsedQuantity)) {
      throw new Error(ERROR_MESSAGES.NOT_INTEGER);
    }
    if (parsedQuantity !== Number(originalQuantity)) {
      throw new Error(ERROR_MESSAGES.DECIMAL_QUANTITY);
    }
  }

  static #validatePositive(quantity) {
    if (quantity <= 0) {
      throw new Error(ERROR_MESSAGES.NEGATIVE_QUANTITY);
    }
  }

  static #validateStock(name, quantity, productService) {
    const product = productService.findProduct(name);
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    const totalStock = this.#calculateTotalStock(product, productService);
    if (quantity > totalStock) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }
  }

  static #calculateTotalStock(product, productService) {
    const normalProduct = productService.findProduct(product.name);
    const promotionProduct = productService.findPromotionProduct(product.name);

    const normalStock = normalProduct ? normalProduct.quantity : 0;
    const promotionStock = promotionProduct ? promotionProduct.quantity : 0;

    return normalStock + promotionStock;
  }

  static validateYesNoInput(input) {
    if (!input || !input.trim()) {
      throw new Error(ERROR_MESSAGES.EMPTY_INPUT);
    }

    const upperInput = input.trim().toUpperCase();
    if (upperInput !== 'Y' && upperInput !== 'N') {
      throw new Error(ERROR_MESSAGES.INVALID_YES_NO);
    }

    return upperInput === 'Y';
  }
}

export default Validator;
