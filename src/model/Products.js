//@ts-check

import outputView from '../views/outputView/OutputView.js';

class Products {
  constructor(products, promotions) {
    this.products = products;
    this.promotions = promotions;
  }

  findPromotionProduct(name) {
    return this.products.find(
      (product) => product.name === name && product.promotion !== 'null'
    );
  }

  findNormalProduct(name) {
    return this.products.find(
      (product) => product.name === name && product.promotion === 'null'
    );
  }

  updateStock(name, quantity, isPromotion = false) {
    const promotionProduct = this.findPromotionProduct(name);
    const normalProduct = this.findNormalProduct(name);
    const requestedQuantity = parseInt(quantity);

    if (isPromotion && promotionProduct) {
      const promotionStock = parseInt(promotionProduct.quantity);

      // 프로모션 상품 재고가 충분한 경우
      if (promotionStock >= requestedQuantity) {
        promotionProduct.quantity = (
          promotionStock - requestedQuantity
        ).toString();
        return;
      }

      // 프로모션 재고 부족 시 에러 발생
      throw new Error('프로모션 재고 부족');
    }

    // 일반 상품 차감
    if (normalProduct) {
      const normalStock = parseInt(normalProduct.quantity);
      if (normalStock >= requestedQuantity) {
        normalProduct.quantity = (normalStock - requestedQuantity).toString();
        return;
      }
    }

    throw new Error('[ERROR] 상품의 재고가 부족합니다.');
  }

  calculateGiftQuantity(product, quantity) {
    if (!product || !product.promotion) return 0;
    const promotion = this.findPromotion(product.promotion);
    if (!promotion) return 0;

    const buyQuantity = parseInt(promotion.buy);
    const getQuantity = parseInt(promotion.get);
    const requiredQuantity = buyQuantity + getQuantity;

    const promotionSets = Math.floor(quantity / requiredQuantity);
    return promotionSets * getQuantity;
  }

  findPromotion(promotionName) {
    // App 클래스의 promotions 데이터를 참조할 수 있도록 수정 필요
    return this.promotions?.find((p) => p.name === promotionName);
  }

  findProduct(name) {
    return this.products.find((product) => product.name === name);
  }

  async showProducts() {
    const productGroups = this.#groupProductsByName();

    this.#printProductGroups(productGroups);
  }

  #groupProductsByName() {
    const productMap = new Map();
    this.products.forEach((product) => {
      const products = productMap.get(product.name) || [];
      productMap.set(product.name, [...products, product]);
    });
    return productMap;
  }

  #printProductGroups(productGroups) {
    for (const [name, products] of productGroups) {
      this.#printProducts(name, products);
    }
  }

  #printProducts(name, products) {
    products.forEach((product) => {
      const message = this.#formatProductMessage(name, product);
      outputView.printMessage(message);
    });
  }

  #formatProductMessage(name, product) {
    const quantity = this.#formatQuantity(product.quantity);
    const promotion = this.#formatPromotion(product.promotion);
    return `- ${name} ${product.price}원 ${quantity}${promotion}`;
  }

  #formatQuantity(quantity) {
    return Number(quantity) <= 0 ? '재고 없음' : `${quantity}개`;
  }

  #formatPromotion(promotion) {
    return promotion !== 'null' ? ` ${promotion}` : '';
  }

  calculatePrice(product, quantity) {
    return parseInt(product.price) * parseInt(quantity);
  }
}

export default Products;
