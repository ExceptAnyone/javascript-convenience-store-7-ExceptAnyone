//@ts-check

import outputView from '../views/outputView/OutputView.js';

class Products {
  constructor(products) {
    this.products = products;
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
    const product = isPromotion
      ? this.findPromotionProduct(name)
      : this.findNormalProduct(name);

    if (product && parseInt(product.quantity) >= parseInt(quantity)) {
      product.quantity = (
        parseInt(product.quantity) - parseInt(quantity)
      ).toString();
    }
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
