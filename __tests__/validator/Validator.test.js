import Validator from '../../src/validator/Validator';
import { ERROR_MESSAGES } from '../../src/constants/errorMessages';

describe('Validator', () => {
  let mockProductService;

  beforeEach(() => {
    mockProductService = {
      findProduct: jest.fn(),
      findPromotionProduct: jest.fn(),
    };
  });

  describe('validatePurchaseInput', () => {
    test('올바른 형식의 입력을 파싱해야 한다', () => {
      mockProductService.findProduct.mockReturnValue({ quantity: 10 });
      const input = '[콜라-2][물-1]';

      const result = Validator.validatePurchaseInput(input, mockProductService);

      expect(result).toEqual([
        { name: '콜라', quantity: '2' },
        { name: '물', quantity: '1' },
      ]);
    });

    test('빈 입력이면 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validatePurchaseInput('', mockProductService);
      }).toThrow(ERROR_MESSAGES.EMPTY_INPUT);
    });

    test('올바르지 않은 형식이면 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validatePurchaseInput('콜라-2', mockProductService);
      }).toThrow(ERROR_MESSAGES.INVALID_FORMAT);
    });

    test('수량이 정수가 아니면 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validatePurchaseInput('[콜라-2.5]', mockProductService);
      }).toThrow(ERROR_MESSAGES.DECIMAL_QUANTITY);
    });

    test('수량이 음수이면 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validatePurchaseInput('[콜라--2]', mockProductService);
      }).toThrow(ERROR_MESSAGES.INVALID_FORMAT);
    });

    test('재고가 부족하면 에러를 발생시켜야 한다', () => {
      mockProductService.findProduct.mockReturnValue({ quantity: 1 });

      expect(() => {
        Validator.validatePurchaseInput('[콜라-2]', mockProductService);
      }).toThrow(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    });
  });

  describe('validateYesNoInput', () => {
    test('Y 또는 N을 반환해야 한다', () => {
      expect(Validator.validateYesNoInput('Y')).toBe(true);
      expect(Validator.validateYesNoInput('N')).toBe(false);
      expect(Validator.validateYesNoInput('y')).toBe(true);
      expect(Validator.validateYesNoInput('n')).toBe(false);
    });

    test('Y나 N이 아닌 입력은 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validateYesNoInput('A');
      }).toThrow(ERROR_MESSAGES.INVALID_YES_NO);
    });

    test('빈 입력은 에러를 발생시켜야 한다', () => {
      expect(() => {
        Validator.validateYesNoInput('');
      }).toThrow(ERROR_MESSAGES.EMPTY_INPUT);
    });
  });
});
