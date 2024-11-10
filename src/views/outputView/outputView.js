//@ts-check
import { Console } from '@woowacourse/mission-utils';
import { GAME_MESSAGES } from '../../constants/gameMessages.js';

const outputView = {
  printMessages(message) {
    Console.print(message);
  },

  printProducts(products) {
    this.printMessages(GAME_MESSAGES.INTRODUCE_PRODUCT_LIST);
    products.forEach((product) => {
      this.printMessages(product.toString());
    });
  },

  printErrorMessage(error) {
    this.printMessages(error.message);
  },

  printReceiptHeader() {
    this.printMessages('\n===========W 편의점=============');
    this.printMessages('상품명\t\t수량\t금액');
  },

  printReceipt(purchaseResult) {
    this.printReceiptHeader();
    this.printPurchaseItems(purchaseResult.purchaseItems);
    this.printGiftItems(purchaseResult.giftItems);
    this.printTotalAmounts(purchaseResult);
  },

  printPurchaseItems(purchaseItems) {
    purchaseItems.forEach(({ name, quantity, price }) => {
      const nameField = this.formatNameField(name);
      this.printMessages(`${nameField}${quantity}\t${price.toLocaleString()}`);
    });
  },

  printGiftItems(giftItems) {
    if (giftItems.size === 0) return;

    this.printMessages('===========증\t정=============');
    giftItems.forEach((quantity, name) => {
      this.printMessages(`${this.formatNameField(name)}${quantity}`);
    });
  },

  formatNameField(name) {
    if (name.length > 3) return `${name} \t`;
    return `${name}\t\t`;
  },

  printTotalAmounts(purchaseResult) {
    const { totalPrice, totalDiscount, membershipDiscount, totalQuantity } =
      purchaseResult;

    this.printMessages('==============================');
    this.printAmount('총구매액', totalPrice, totalQuantity);
    this.printDiscount('행사할인', totalDiscount);
    this.printDiscount('멤버십할인', membershipDiscount);
    this.printFinalAmount(totalPrice, totalDiscount, membershipDiscount);
  },

  printAmount(label, amount, totalQuantity) {
    const labelField = label.length > 2 ? `${label} \t` : `${label}\t\t`;
    this.printMessages(
      `${labelField}${totalQuantity}\t${amount.toLocaleString()}`
    );
  },

  printDiscount(label, amount) {
    const labelField = label.length > 2 ? `${label} \t` : `${label}\t\t`;
    this.printMessages(`${labelField}\t-${amount.toLocaleString()}`);
  },

  printFinalAmount(totalPrice, totalDiscount, membershipDiscount) {
    const finalPrice = totalPrice - totalDiscount - (membershipDiscount || 0);
    this.printMessages(`내실돈\t\t\t${finalPrice.toLocaleString()}`);
  },
};

export default outputView;
