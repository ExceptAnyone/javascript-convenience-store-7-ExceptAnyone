//@ts-check

import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import Product from './Products.js';

class ProductRepository {
  #products = [];

  initializeProducts(productsData) {
    this.#products = productsData.map(
      (data) =>
        new Product(data.name, data.price, data.quantity, data.promotion)
    );
  }

  findPromotionProduct(name) {
    return this.#products.find(
      (product) => product.name === name && product.hasPromotion()
    );
  }

  findNormalProduct(name) {
    return this.#products.find(
      (product) => product.name === name && !product.hasPromotion()
    );
  }

  getAllProducts() {
    const productNames = this.#getUniqueProductNames();
    return productNames.flatMap((name) => this.#getProductsByName(name));
  }

  #getUniqueProductNames() {
    return [...new Set(this.#products.map((product) => product.name))];
  }

  #getProductsByName(name) {
    const promotionProduct = this.findPromotionProduct(name);
    const normalProduct = this.findNormalProduct(name);

    if (!promotionProduct) return [normalProduct].filter(Boolean);

    return [
      promotionProduct,
      !normalProduct
        ? new Product(name, promotionProduct.price, 0, null)
        : normalProduct,
    ];
  }

  updateStock(name, quantity, isPromotion) {
    const product = isPromotion
      ? this.findPromotionProduct(name)
      : this.findNormalProduct(name);

    if (!product) throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);

    if (product.quantity < quantity)
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK);

    product.quantity -= quantity;
  }
}

export default ProductRepository;
