import ProductService from '../../src/service/ProductService.js';
import { ERROR_MESSAGES } from '../../src/constants/errorMessages.js';
import fileReader from '../../src/fileReader/fileReader.js';

jest.mock('../../src/fileReader/fileReader', () => ({
  readProductsFile: jest.fn(),
}));

describe('ProductService', () => {
  let productService;
  const mockProductsData = [
    { name: '콜라', price: '1000', quantity: '10', promotion: '탄산2+1' },
    { name: '콜라', price: '1000', quantity: '10', promotion: null },
    { name: '물', price: '500', quantity: '10', promotion: null },
    { name: '사이다', price: '1000', quantity: '8', promotion: '탄산2+1' },
  ];

  beforeEach(() => {
    productService = new ProductService();
    fileReader.readProductsFile.mockResolvedValue(mockProductsData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('상품 데이터를 초기화해야 한다', async () => {
      await productService.initialize();

      const products = productService.findProduct('콜라');

      expect(products).toBeDefined();
      expect(products.name).toBe('콜라');
    });
  });

  describe('findProduct', () => {
    beforeEach(async () => {
      await productService.initialize();
    });

    test('프로모션 상품을 우선적으로 찾아야 한다', () => {
      const product = productService.findProduct('콜라');

      expect(product.hasPromotion()).toBe(true);
      expect(product.promotion).toBe('탄산2+1');
    });

    test('프로모션 상품이 없으면 일반 상품을 찾아야 한다', () => {
      const product = productService.findProduct('물');

      expect(product.hasPromotion()).toBe(false);
      expect(product.name).toBe('물');
    });

    test('존재하지 않는 상품은 undefined를 반환해야 한다', () => {
      const product = productService.findProduct('없는상품');

      expect(product).toBeUndefined();
    });
  });

  describe('updateStock', () => {
    beforeEach(async () => {
      await productService.initialize();
    });

    test('프로모션 상품의 재고를 업데이트해야 한다', () => {
      productService.updateStock('콜라', 3, true);

      const product = productService.findProduct('콜라');
      expect(product.quantity).toBe(7);
    });

    test('일반 상품의 재고를 업데이트해야 한다', () => {
      productService.updateStock('물', 2, false);

      const product = productService.findProduct('물');
      console.log('product', product);
      expect(product.quantity).toBe(8);
    });

    test('재고가 부족한 경우 에러를 발생시켜야 한다', () => {
      expect(() => {
        productService.updateStock('물', 100, false);
      }).toThrow(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    });
  });

  describe('calculatePrice', () => {
    test('상품 가격과 수량을 곱한 값을 반환해야 한다', () => {
      const product = { price: 1000 };
      const quantity = 3;

      expect(productService.calculatePrice(product, quantity)).toBe(3000);
    });
  });
});
