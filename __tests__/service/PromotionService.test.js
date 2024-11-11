import PromotionService from '../../src/service/PromotionService.js';
import { DateTimes } from '@woowacourse/mission-utils';
import inputView from '../../src/views/inputView/inputView.js';
import fileReader from '../../src/fileReader/fileReader.js';

jest.mock('../../src/fileReader/fileReader', () => ({
  readPromotionsFile: jest.fn(),
}));

jest.mock('../../src/views/inputView/InputView', () => ({
  readUserInput: jest.fn(),
}));

describe('PromotionService', () => {
  let promotionService;
  const mockPromotionsData = [
    {
      name: '탄산2+1',
      buy: '2',
      get: '1',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    },
    {
      name: 'MD추천상품',
      buy: '1',
      get: '1',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    },
  ];

  beforeEach(() => {
    promotionService = new PromotionService();
    fileReader.readPromotionsFile.mockResolvedValue(mockPromotionsData);
    jest.spyOn(DateTimes, 'now').mockReturnValue(new Date('2024-01-15'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    test('프로모션 데이터를 초기화해야 한다', async () => {
      await promotionService.initialize();

      const promotion = promotionService.findPromotion('탄산2+1');
      expect(promotion).toBeDefined();
      expect(promotion.name).toBe('탄산2+1');
    });
  });

  describe('findPromotion', () => {
    beforeEach(async () => {
      await promotionService.initialize();
    });

    test('유효한 프로모션을 찾아야 한다', () => {
      const promotion = promotionService.findPromotion('탄산2+1');

      expect(promotion).toBeDefined();
      expect(promotion.name).toBe('탄산2+1');
    });

    test('존재하지 않는 프로모션은 null을 반환해야 한다', () => {
      const promotion = promotionService.findPromotion('없는프로모션');

      expect(promotion).toBeNull();
    });
  });

  describe('calculateDiscount', () => {
    beforeEach(async () => {
      await promotionService.initialize();
    });

    test('프로모션 할인 금액을 계산해야 한다', () => {
      const product = {
        price: 1000,
        quantity: 10,
        promotion: '탄산2+1',
      };
      const quantity = 6;

      const discount = promotionService.calculateDiscount(product, quantity);
      expect(discount).toBe(2000);
    });

    test('프로모션이 없는 경우 할인 금액은 0이어야 한다', () => {
      const product = {
        price: 1000,
        quantity: 10,
        promotion: null,
      };
      const quantity = 6;

      const discount = promotionService.calculateDiscount(product, quantity);
      expect(discount).toBe(0);
    });
  });

  describe('calculateGiftQuantity', () => {
    beforeEach(async () => {
      await promotionService.initialize();
    });

    test('증정 수량을 계산해야 한다', () => {
      const product = {
        quantity: 10,
        promotion: '탄산2+1',
      };
      const quantity = 6;

      const giftQuantity = promotionService.calculateGiftQuantity(
        product,
        quantity
      );
      expect(giftQuantity).toBe(2);
    });

    test('프로모션이 없는 경우 증정 수량은 0이어야 한다', () => {
      const product = {
        quantity: 10,
        promotion: null,
      };
      const quantity = 6;

      const giftQuantity = promotionService.calculateGiftQuantity(
        product,
        quantity
      );
      expect(giftQuantity).toBe(0);
    });
  });

  describe('isPromotionApplicable', () => {
    beforeEach(async () => {
      await promotionService.initialize();
    });

    test('프로모션이 없는 경우 true를 반환해야 한다', async () => {
      const product = {
        hasPromotion: () => false,
      };

      const result = await promotionService.isPromotionApplicable(product, 1);
      expect(result).toBe(true);
    });

    test('프로모션 적용이 가능한 경우 사용자 입력에 따라 결과를 반환해야 한다', async () => {
      const product = {
        name: '콜라',
        quantity: 10,
        hasPromotion: () => true,
        promotion: '탄산2+1',
      };
      inputView.readUserInput.mockResolvedValue('Y');

      const result = await promotionService.isPromotionApplicable(product, 5);
      expect(result).toBe(true);
    });
  });
});
