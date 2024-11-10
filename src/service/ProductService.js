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
    let remainingQuantity = quantity;

    if (promotionProduct?.quantity > 0) {
      const availablePromotion = Math.min(promotionProduct.quantity, quantity);
      promotionProduct.quantity -= availablePromotion;
      remainingQuantity -= availablePromotion;
    }

    if (remainingQuantity > 0) {
      if (!normalProduct) throw new Error('[ERROR] 상품의 재고가 부족합니다.');
      normalProduct.quantity -= remainingQuantity;
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
