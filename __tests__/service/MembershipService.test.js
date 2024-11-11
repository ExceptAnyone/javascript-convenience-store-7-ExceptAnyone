import MembershipService from '../../src/service/MembershipService.js';

describe('memberShipService', () => {
  let membershipService;

  beforeEach(() => {
    membershipService = new MembershipService();
  });

  test('할인을 정확히 계산한다', () => {
    expect(membershipService.calculateDiscount(6000)).toBe(1800);
  });

  test('최대 할인 금액을 초과하면 최대 할인 금액을 반환해야 한다', () => {
    const amount = 100000;
    const discount = membershipService.calculateDiscount(amount);

    expect(discount).toBe(8000);
  });
});
