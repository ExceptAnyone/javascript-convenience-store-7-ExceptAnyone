import PurchaseService from '../../src/service/PurchaseService';
import fileReader from '../../src/fileReader/fileReader';
import { DateTimes } from '@woowacourse/mission-utils';
import inputView from '../../src/views/inputView/InputView';
import { ERROR_MESSAGES } from '../../src/constants/errorMessages';

jest.mock('../../src/fileReader/fileReader', () => ({
  readProductsFile: jest.fn(),
  readPromotionsFile: jest.fn(),
}));

jest.mock('../../src/views/inputView/InputView', () => ({
  readUserInput: jest.fn(),
}));

describe('PurchaseService', () => {
  let purchaseService;
  const mockProductsData = [
    { name: '콜라', price: '1000', quantity: '10', promotion: '탄산2+1' },
    { name: '물', price: '500', quantity: '10', promotion: null },
    { name: '사이다', price: '1000', quantity: '8', promotion: '탄산2+1' },
  ];

  const mockPromotionsData = [
    {
      name: '탄산2+1',
      buy: '2',
      get: '1',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    },
  ];

  beforeEach(() => {
    purchaseService = new PurchaseService();
    fileReader.readProductsFile.mockResolvedValue(mockProductsData);
    fileReader.readPromotionsFile.mockResolvedValue(mockPromotionsData);
    jest.spyOn(DateTimes, 'now').mockReturnValue(new Date('2024-01-15'));
    inputView.readUserInput.mockResolvedValue('Y');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    test('상품과 프로모션 데이터를 초기화해야 한다', async () => {
      await purchaseService.initialize();

      await purchaseService.processPurchase([{ name: '콜라', quantity: 3 }]);
      const result = await purchaseService.processPurchase([
        { name: '콜라', quantity: 3 },
      ]);

      expect(result.purchaseItems[0].name).toBe('콜라');
    });
  });

  describe('processPurchase', () => {
    beforeEach(async () => {
      await purchaseService.initialize();
    });

    test('일반 상품 구매를 처리해야 한다', async () => {
      const result = await purchaseService.processPurchase([
        { name: '물', quantity: 2 },
      ]);

      expect(result.purchaseItems[0].price).toBe(1000);
      expect(result.totalPrice).toBe(1000);
      expect(result.totalDiscount).toBe(0);
    });

    test('프로모션 상품 구매를 처리해야 한다', async () => {
      const result = await purchaseService.processPurchase([
        { name: '콜라', quantity: 6 },
      ]);

      expect(result.purchaseItems[0].price).toBe(6000);
      expect(result.totalPrice).toBe(6000);
      expect(result.totalDiscount).toBe(2000);
      expect(result.giftItems.get('콜라')).toBe(2);
    });

    test('존재하지 않는 상품 구매시 에러를 발생시켜야 한다', async () => {
      await expect(
        purchaseService.processPurchase([{ name: '없는상품', quantity: 1 }])
      ).rejects.toThrow(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    });
  });
});
