//@ts-check
import { DateTimes } from '@woowacourse/mission-utils';

class Promotion {
  constructor(name, buy, get, startDate, endDate) {
    this.name = name;
    this.buy = parseInt(buy);
    this.get = parseInt(get);
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  isValid(currentDate = DateTimes.now()) {
    return currentDate >= this.startDate && currentDate <= this.endDate;
  }

  calculateSetSize() {
    return this.buy + this.get;
  }

  calculatePromotionSets(quantity) {
    return Math.floor(quantity / this.calculateSetSize());
  }

  calculateRemainder(quantity) {
    return quantity % this.calculateSetSize();
  }
}

export default Promotion;
