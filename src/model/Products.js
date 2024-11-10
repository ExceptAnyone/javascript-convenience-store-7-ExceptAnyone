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
    const stockStatus = this.hasStock() ? `${this.quantity}개` : '재고 없음';
    const promotionText = this.hasPromotion() ? ` ${this.promotion}` : '';
    return `- ${
      this.name
    } ${this.price.toLocaleString()}원 ${stockStatus}${promotionText}`;
  }
}

export default Product;
