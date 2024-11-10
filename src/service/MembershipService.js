//@ts-check

class MembershipService {
  #MEMBERSHIP_DISCOUNT_RATE = 0.3;
  #MAX_DISCOUNT_AMOUNT = 8000;

  async initialize() {}

  calculateDiscount(amount) {
    const discountAmount = Math.floor(amount * this.#MEMBERSHIP_DISCOUNT_RATE);
    return Math.min(discountAmount, this.#MAX_DISCOUNT_AMOUNT);
  }
}

export default MembershipService;
