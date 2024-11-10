import { DateTimes } from '@woowacourse/mission-utils';
import Promotion from '../../src/model/Promotion';

describe('Promotion', () => {
  describe('constructor', () => {
    test('프로모션 객체가 올바르게 생성되어야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-01-01',
        '2024-12-31'
      );

      expect(promotion.name).toBe('탄산2+1');
      expect(promotion.buy).toBe(2);
      expect(promotion.get).toBe(1);
      expect(promotion.startDate).toEqual(new Date('2024-01-01'));
      expect(promotion.endDate).toEqual(new Date('2024-12-31'));
    });
  });

  describe('isValid', () => {
    beforeEach(() => {
      jest.spyOn(DateTimes, 'now').mockReturnValue(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('현재 날짜가 프로모션 기간 내에 있으면 true를 반환해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-01-01',
        '2024-12-31'
      );

      expect(promotion.isValid()).toBe(true);
    });

    test('현재 날짜가 프로모션 시작일 이전이면 false를 반환해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-02-01',
        '2024-12-31'
      );

      expect(promotion.isValid()).toBe(false);
    });

    test('현재 날짜가 프로모션 종료일 이후면 false를 반환해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2023-01-01',
        '2023-12-31'
      );

      expect(promotion.isValid()).toBe(false);
    });
  });

  describe('calculateSetSize', () => {
    test('구매 수량과 증정 수량의 합을 반환해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-01-01',
        '2024-12-31'
      );

      expect(promotion.calculateSetSize()).toBe(3); // 2(buy) + 1(get)
    });
  });

  describe('calculatePromotionSets', () => {
    test('주어진 수량으로 만들 수 있는 프로모션 세트 수를 계산해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-01-01',
        '2024-12-31'
      );

      expect(promotion.calculatePromotionSets(6)).toBe(2); // 6개로 2세트
      expect(promotion.calculatePromotionSets(4)).toBe(1); // 4개로 1세트
      expect(promotion.calculatePromotionSets(2)).toBe(0); // 2개로는 세트 불가능
    });
  });

  describe('calculateRemainder', () => {
    test('프로모션 세트 적용 후 남은 수량을 계산해야 한다', () => {
      const promotion = new Promotion(
        '탄산2+1',
        '2',
        '1',
        '2024-01-01',
        '2024-12-31'
      );

      expect(promotion.calculateRemainder(7)).toBe(1);
      expect(promotion.calculateRemainder(6)).toBe(0);
      expect(promotion.calculateRemainder(4)).toBe(1);
    });
  });
});
