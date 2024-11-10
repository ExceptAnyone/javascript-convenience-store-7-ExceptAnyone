//@ts-check

import fileReader from '../fileReader/fileReader.js';
import outputView from '../views/outputView/OutputView.js';
import ProductRepository from '../model/ProductRepository.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class ProductService {
  #productRepository;

  constructor() {
    this.#productRepository = new ProductRepository();
  }

  async initialize() {
    const productsData = await fileReader.readProductsFile();
    this.#productRepository.initializeProducts(productsData);
  }

  showProducts() {
    const products = this.#productRepository.getAllProducts();
    outputView.printProducts(products);
  }

  findProduct(name) {
    return this.#findPromotionOrNormalProduct(name);
  }

  #findPromotionOrNormalProduct(name) {
    const promotionProduct = this.#productRepository.findPromotionProduct(name);
    if (promotionProduct) return promotionProduct;
    return this.#productRepository.findNormalProduct(name);
  }

  updateStock(name, quantity, isPromotion) {
    if (isPromotion) {
      this.#updatePromotionStock(name, quantity);
      return;
    }
    this.#updateNormalStock(name, quantity);
  }

  #updatePromotionStock(name, quantity) {
    const product = this.#productRepository.findPromotionProduct(name);
    this.#validateStock(product, quantity);
    product.quantity -= quantity;
  }

  #updateNormalStock(name, quantity) {
    const product = this.#productRepository.findNormalProduct(name);
    this.#validateStock(product, quantity);
    product.quantity -= quantity;
  }

  #validateStock(product, quantity) {
    if (!product || product.quantity < quantity) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }
  }

  calculatePrice(product, quantity) {
    return product.price * quantity;
  }

  findPromotionProduct(name) {
    return this.#productRepository.findPromotionProduct(name);
  }
}

export default ProductService;
