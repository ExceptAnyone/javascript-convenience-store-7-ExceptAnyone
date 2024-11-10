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

    purchaseResult.purchaseItems.forEach(({ name, quantity, price }) => {
      this.printMessages(`${name}\t\t${quantity}\t${price.toLocaleString()}`);
    });

    if (purchaseResult.giftItems.size > 0) {
      this.printMessages('===========증\t정=============');
      purchaseResult.giftItems.forEach((quantity, name) => {
        this.printMessages(`${name}\t\t${quantity}`);
      });
    }

    this.printMessages('==============================');
    this.printMessages(
      `총구매액\t\t${purchaseResult.totalPrice.toLocaleString()}`
    );

    if (purchaseResult.totalDiscount > 0) {
      this.printMessages(
        `행사할인\t\t-${purchaseResult.totalDiscount.toLocaleString()}`
      );
    }

    this.printMessages(
      `멤버십할인\t\t-${purchaseResult.membershipDiscount.toLocaleString()}`
    );

    const finalPrice =
      purchaseResult.totalPrice -
      purchaseResult.totalDiscount -
      (purchaseResult.membershipDiscount || 0);
    this.printMessages(`내실돈\t\t\t ${finalPrice.toLocaleString()}`);
  },
};

export default outputView;
