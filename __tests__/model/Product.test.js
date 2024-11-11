import Product from '../../src/model/Products.js';

describe('Product', () => {
  describe('constructor', () => {
    test('상품 객체가 올바르게 생성되어야 한다', () => {
      const product = new Product('콜라', '1000', '10', '탄산2+1');

      expect(product.name).toBe('콜라');
      expect(product.price).toBe(1000);
      expect(product.quantity).toBe(10);
      expect(product.promotion).toBe('탄산2+1');
    });

    test('promotion이 없는 경우 null로 설정되어야 한다', () => {
      const product = new Product('물', '500', '10');

      expect(product.promotion).toBe(null);
    });
  });

  describe('hasPromotion', () => {
    test('프로모션이 있는 경우 true를 반환해야 한다', () => {
      const product = new Product('콜라', '1000', '10', '탄산2+1');

      expect(product.hasPromotion()).toBe(true);
    });

    test('프로모션이 없는 경우 false를 반환해야 한다', () => {
      const product = new Product('물', '500', '10');

      expect(product.hasPromotion()).toBe(false);
    });
  });

  describe('hasStock', () => {
    test('재고가 있는 경우 true를 반환해야 한다', () => {
      const product = new Product('콜라', '1000', '10', '탄산2+1');

      expect(product.hasStock()).toBe(true);
    });

    test('재고가 0인 경우 false를 반환해야 한다', () => {
      const product = new Product('콜라', '1000', '0', '탄산2+1');

      expect(product.hasStock()).toBe(false);
    });
  });

  describe('toString', () => {
    test('프로모션이 있는 상품의 문자열 표현을 반환해야 한다', () => {
      const product = new Product('콜라', '1000', '10', '탄산2+1');

      expect(product.toString()).toBe('- 콜라 1,000원 10개 탄산2+1');
    });

    test('프로모션이 없는 상품의 문자열 표현을 반환해야 한다', () => {
      const product = new Product('물', '500', '10');

      expect(product.toString()).toBe('- 물 500원 10개');
    });

    test('재고가 없는 상품의 문자열 표현을 반환해야 한다', () => {
      const product = new Product('물', '500', '0');

      expect(product.toString()).toBe('- 물 500원 재고 없음');
    });
  });
});
