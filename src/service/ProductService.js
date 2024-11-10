//@ts-check

import fileReader from '../fileReader/fileReader.js';
import outputView from '../views/outputView/OutputView.js';
import ProductRepository from '../model/ProductRepository.js';

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
    const promotionProduct = this.#productRepository.findPromotionProduct(name);
    if (promotionProduct) return promotionProduct;

    return this.#productRepository.findNormalProduct(name);
  }

  updateStock(name, quantity, isPromotion) {
    const products = this.#findProducts(name);

    if (isPromotion) {
      this.#handlePromotionStock(products, quantity);
      return;
    }

    this.#handleNormalStock(products, quantity);
  }

  #findProducts(name) {
    return {
      promotionProduct: this.#productRepository.findPromotionProduct(name),
      normalProduct: this.#productRepository.findNormalProduct(name),
    };
  }

  #handlePromotionStock({ promotionProduct }, quantity) {
    if (!promotionProduct || promotionProduct.quantity < quantity) {
      throw new Error('프로모션 재고 부족');
    }
    promotionProduct.quantity -= quantity;
  }

  #handleNormalStock({ promotionProduct, normalProduct }, quantity) {
    const { availablePromotion, remainingQuantity } =
      this.#calculatePromotionUsage(promotionProduct, quantity);

    this.#updatePromotionStock(promotionProduct, availablePromotion);
    this.#updateNormalStock(normalProduct, remainingQuantity);
  }

  #calculatePromotionUsage(promotionProduct, quantity) {
    if (!promotionProduct || promotionProduct.quantity <= 0) {
      return { availablePromotion: 0, remainingQuantity: quantity };
    }

    const availablePromotion = Math.min(promotionProduct.quantity, quantity);
    const remainingQuantity = quantity - availablePromotion;

    return { availablePromotion, remainingQuantity };
  }

  #updatePromotionStock(promotionProduct, quantity) {
    if (quantity <= 0) return;
    promotionProduct.quantity -= quantity;
  }

  #updateNormalStock(normalProduct, quantity) {
    if (quantity <= 0) return;

    if (!normalProduct) {
      throw new Error('[ERROR] 상품의 재고가 부족합니다.');
    }

    normalProduct.quantity -= quantity;
  }

  calculatePrice(product, quantity) {
    return product.price * quantity;
  }

  findPromotionProduct(name) {
    return this.#productRepository.findPromotionProduct(name);
  }
}

export default ProductService;
