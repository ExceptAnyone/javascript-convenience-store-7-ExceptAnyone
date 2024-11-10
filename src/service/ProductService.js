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
    const promotionProduct = this.#productRepository.findPromotionProduct(name);
    const normalProduct = this.#productRepository.findNormalProduct(name);

    if (isPromotion) {
      if (promotionProduct && promotionProduct.quantity >= quantity) {
        promotionProduct.quantity -= quantity;
        return;
      }
      throw new Error('프로모션 재고 부족');
    }

    // 일반 재고 차감 시 프로모션 재고 우선 사용
    if (promotionProduct && promotionProduct.quantity > 0) {
      const availablePromotion = Math.min(promotionProduct.quantity, quantity);
      promotionProduct.quantity -= availablePromotion;

      const remainingQuantity = quantity - availablePromotion;
      if (remainingQuantity > 0 && normalProduct) {
        normalProduct.quantity -= remainingQuantity;
      }
    } else if (normalProduct) {
      normalProduct.quantity -= quantity;
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
