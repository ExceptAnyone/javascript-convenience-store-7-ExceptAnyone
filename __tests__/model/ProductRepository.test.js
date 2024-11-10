import { ERROR_MESSAGES } from '../../src/constants/errorMessages';
import ProductRepository from '../../src/model/ProductRepository';

describe('ProductRepository', () => {
  let repository;
  let mockProductsData;

  beforeEach(() => {
    repository = new ProductRepository();
    mockProductsData = [
      { name: '콜라', price: '1000', quantity: '10', promotion: '탄산2+1' },
      { name: '콜라', price: '1000', quantity: '10', promotion: null },
      { name: '물', price: '500', quantity: '5', promotion: null },
      { name: '사이다', price: '1000', quantity: '8', promotion: '탄산2+1' },
    ];
  });

  describe('initializeProducts', () => {
    test('상품 데이터로 저장소를 초기화해야 한다', () => {
      repository.initializeProducts(mockProductsData);

      const products = repository.getAllProducts();
      expect(products).toHaveLength(5); //프로모션 상품이 있는데 일반 상품은 없을 때에 재고 없음을 출력해야 하므로 5
    });
  });

  describe('findPromotionProduct', () => {
    beforeEach(() => {
      repository.initializeProducts(mockProductsData);
    });

    test('프로모션이 있는 상품을 찾아야 한다', () => {
      const product = repository.findPromotionProduct('콜라');

      expect(product).toBeDefined();
      expect(product.name).toBe('콜라');
      expect(product.promotion).toBe('탄산2+1');
    });

    test('프로모션이 없는 상품의 경우 undefined를 반환해야 한다', () => {
      const product = repository.findPromotionProduct('물');

      expect(product).toBeUndefined();
    });
  });

  describe('findNormalProduct', () => {
    beforeEach(() => {
      repository.initializeProducts(mockProductsData);
    });

    test('프로모션이 없는 일반 상품을 찾아야 한다', () => {
      const product = repository.findNormalProduct('콜라');

      expect(product).toBeDefined();
      expect(product.name).toBe('콜라');
      expect(product.promotion).toBeNull();
    });

    test('프로모션만 있는 상품의 경우 undefined를 반환해야 한다', () => {
      const onlyPromotionData = [
        { name: '음료', price: '1000', quantity: '10', promotion: '탄산2+1' },
      ];
      repository.initializeProducts(onlyPromotionData);

      const product = repository.findNormalProduct('음료');
      expect(product).toBeUndefined();
    });
  });

  describe('getAllProducts', () => {
    beforeEach(() => {
      repository.initializeProducts(mockProductsData);
    });

    test('모든 상품을 반환해야 한다', () => {
      const products = repository.getAllProducts();

      expect(products).toHaveLength(5);
      expect(products.filter((p) => p.name === '콜라')).toHaveLength(2);
      expect(products.filter((p) => p.name === '물')).toHaveLength(1);
      expect(products.filter((p) => p.name === '사이다')).toHaveLength(2);
    });

    test('프로모션 상품이 없는 경우 일반 상품만 반환해야 한다', () => {
      const normalProductData = [
        { name: '물', price: '500', quantity: '5', promotion: null },
      ];
      repository.initializeProducts(normalProductData);

      const products = repository.getAllProducts();
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('물');
      expect(products[0].promotion).toBeNull();
    });
  });

  describe('updateStock', () => {
    beforeEach(() => {
      repository.initializeProducts(mockProductsData);
    });

    test('프로모션 상품의 재고를 업데이트해야 한다', () => {
      repository.updateStock('콜라', 3, true);

      const product = repository.findPromotionProduct('콜라');
      expect(product.quantity).toBe(7);
    });

    test('일반 상품의 재고를 업데이트해야 한다', () => {
      repository.updateStock('콜라', 2, false);

      const product = repository.findNormalProduct('콜라');
      expect(product.quantity).toBe(8);
    });

    test('재고가 부족한 경우 에러를 발생시켜야 한다', () => {
      expect(() => {
        repository.updateStock('콜라', 15, false);
      }).toThrow(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    });

    test('존재하지 않는 상품의 경우 에러를 발생시켜야 한다', () => {
      expect(() => {
        repository.updateStock('없는상품', 1, false);
      }).toThrow(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    });
  });
});
