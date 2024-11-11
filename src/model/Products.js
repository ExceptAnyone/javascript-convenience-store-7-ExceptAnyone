//@ts-check
class Product {
  constructor(name, price, quantity, promotion = null) {
    this.name = name;
    this.price = parseInt(price);
    this.quantity = parseInt(quantity);
    this.promotion = promotion;
  }

  hasPromotion() {
    return this.promotion !== null && this.promotion !== 'null';
  }

  hasStock() {
    return this.quantity > 0;
  }

  toString() {
    const price = this.#formatPrice();
    const quantity = this.#formatQuantity();
    const promotion = this.#formatPromotion();

    return `- ${this.name} ${price} ${quantity}${promotion}`;
  }

  #formatPrice() {
    return `${this.price.toLocaleString()}원`;
  }

  #formatQuantity() {
    if (!this.hasStock()) {
      return '재고 없음';
    }
    return `${this.quantity}개`;
  }

  #formatPromotion() {
    if (!this.promotion || this.promotion === 'null') {
      return '';
    }
    return ` ${this.promotion}`;
  }
}

export default Product;
