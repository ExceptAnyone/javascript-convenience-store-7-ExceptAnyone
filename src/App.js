//@ts-check

import { GAME_MESSAGES } from './constants/gameMessages.js';
import fileReader from './fileReader/fileReader.js';
import Products from './model/Products.js';
import inputView from './views/inputView/InputView.js';
import outputView from './views/outputView/OutputView.js';

class App {
  #products;
  #promotions;
  #totalPrize;
  #totalDiscount;
  #membershipDiscount;
  #giftItems;

  constructor() {
    this.#totalPrize = 0;
    this.#totalDiscount = 0;
    this.#membershipDiscount = 0;
    this.#giftItems = new Map();
  }

  async run() {
    this.#introduce();
    await this.#initialize();
    await this.#products.showProducts();
    await this.purchaseProducts();
  }

  async purchaseProducts() {
    try {
      await this.#products.showProducts();
      const products = await inputView.readUserInput(
        GAME_MESSAGES.ENTER_PRODUCT_INFO
      );
      const purchaseList = this.#parsePurchaseInput(products);

      for (const { name, quantity } of purchaseList) {
        const product = this.#products.findProduct(name);
        const isPromotionApplicable = await this.#isPromotionApplicable(
          product,
          parseInt(quantity)
        );

        if (!isPromotionApplicable) {
          const confirmPurchase = await this.#confirmNonPromotionalPurchase(
            name,
            quantity
          );
          if (!confirmPurchase) {
            return await this.purchaseProducts();
          }
        }

        const basePrice = this.#products.calculatePrice(product, quantity);
        const promotionDiscount = this.#calculatePromotionDiscount(
          product,
          parseInt(quantity)
        );
        const giftQuantity = this.#calculateGiftQuantity(
          product,
          parseInt(quantity)
        );

        // 구매 수량만큼 재고 차감 (프로모션 상품 우선)
        const promotionProduct = this.#products.findPromotionProduct(name);
        const normalProduct = this.#products.findNormalProduct(name);

        if (promotionProduct && parseInt(promotionProduct.quantity) > 0) {
          this.#products.updateStock(name, quantity, true); // 프로모션 상품 재고 차감
        } else if (normalProduct) {
          this.#products.updateStock(name, quantity, false); // 일반 상품 재고 차감
        }

        // 증정 수량도 프로모션 상품 우선 차감
        if (giftQuantity > 0) {
          if (
            promotionProduct &&
            parseInt(promotionProduct.quantity) >= giftQuantity
          ) {
            this.#products.updateStock(name, giftQuantity, true);
          } else if (normalProduct) {
            this.#products.updateStock(name, giftQuantity, false);
          }

          this.#giftItems.set(
            name,
            (this.#giftItems.get(name) || 0) + giftQuantity
          );
        }

        this.#totalPrize += basePrice;
        this.#totalDiscount += promotionDiscount;
      }

      await this.#askForMembership();
      await this.#printReceipt(purchaseList);

      const continueShopping = await this.#askForContinueShopping();
      if (continueShopping) {
        this.#resetPurchaseData();
        return await this.purchaseProducts();
      }
    } catch (error) {
      outputView.printErrorMessage(error);
      await this.purchaseProducts();
    }
  }

  #resetPurchaseData() {
    this.#totalPrize = 0;
    this.#totalDiscount = 0;
    this.#membershipDiscount = 0;
    this.#giftItems.clear();
  }

  async #askForMembership() {
    const response = await inputView.readUserInput(
      '\n멤버십 할인을 받으시겠습니까? (Y/N)\n'
    );
    if (response.toUpperCase() === 'Y') {
      this.#applyMembershipDiscount();
    }
  }

  #applyMembershipDiscount() {
    const discountAmount = (this.#totalPrize - this.#totalDiscount) * 0.3;
    this.#membershipDiscount = Math.min(discountAmount, 8000);
  }

  async #printReceipt(purchaseList) {
    outputView.printMessage('\n===========W 편의점=============');
    outputView.printMessage('상품명\t\t수량\t금액');

    for (const { name, quantity } of purchaseList) {
      const product = this.#products.findProduct(name);
      const price = this.#products.calculatePrice(product, quantity);
      outputView.printMessage(`${name}\t\t${quantity}\t${price}`);
    }

    if (this.#giftItems.size > 0) {
      outputView.printMessage('===========증\t정=============');
      for (const [name, quantity] of this.#giftItems) {
        outputView.printMessage(`${name}\t\t${quantity}`);
      }
    }

    outputView.printMessage('==============================');
    outputView.printMessage(`총구매액\t\t${this.#totalPrize}`);
    outputView.printMessage(`행사할인\t\t-${this.#totalDiscount}`);
    outputView.printMessage(`멤버십할인\t\t-${this.#membershipDiscount || 0}`);
    outputView.printMessage(
      `내실돈\t\t\t${
        this.#totalPrize - this.#totalDiscount - (this.#membershipDiscount || 0)
      }`
    );
  }

  async #askForContinueShopping() {
    const response = await inputView.readUserInput(
      '\n감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n'
    );
    if (response.toUpperCase() === 'Y') {
      this.#introduce();
      return true;
    }
    return false;
  }

  #isPromotionApplicable(product, quantity) {
    if (!product.promotion || product.promotion === 'null') {
      return true;
    }

    const promotion = this.#promotions.find(
      (p) => p.name === product.promotion
    );
    if (!promotion) {
      return false;
    }

    const buyQuantity = parseInt(promotion.buy);
    const getQuantity = parseInt(promotion.get);
    const requiredQuantity = buyQuantity + getQuantity;

    const promotionSets = Math.floor(quantity / requiredQuantity);
    const remainingQuantity = quantity % requiredQuantity;

    if (promotionSets === 0) {
      if (promotion.buy === '1' && promotion.get === '1' && quantity === 1) {
        return this.#showAdditionalItemMessage(product.name);
      }
      return false;
    }

    if (remainingQuantity > 0) {
      return this.#confirmPartialPromotion(product.name, remainingQuantity);
    }

    return true;
  }

  async #showAdditionalItemMessage(productName) {
    const message = `현재 ${productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`;
    const response = await inputView.readUserInput(message);
    return response.toUpperCase() === 'Y';
  }

  async #confirmPartialPromotion(productName, remainingQuantity) {
    const message = `현재 ${productName} ${remainingQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`;
    const response = await inputView.readUserInput(message);
    return response.toUpperCase() === 'Y';
  }

  async #confirmNonPromotionalPurchase(name, quantity) {
    const response = await inputView.readUserInput(
      `현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`
    );
    return response.toUpperCase() === 'Y';
  }

  #calculatePromotionDiscount(product, quantity) {
    const promotion = this.#promotions.find(
      (p) => p.name === product.promotion
    );
    if (!promotion) return 0;

    const buyQuantity = parseInt(promotion.buy);
    const getQuantity = parseInt(promotion.get);
    const requiredQuantity = buyQuantity + getQuantity;

    const promotionSets = Math.floor(quantity / requiredQuantity);
    return promotionSets * getQuantity * product.price;
  }

  #calculateGiftQuantity(product, quantity) {
    const promotion = this.#promotions.find(
      (p) => p.name === product.promotion
    );
    if (!promotion) return 0;

    const buyQuantity = parseInt(promotion.buy);
    const getQuantity = parseInt(promotion.get);
    const requiredQuantity = buyQuantity + getQuantity;

    const promotionSets = Math.floor(quantity / requiredQuantity);
    return promotionSets * getQuantity;
  }

  #parsePurchaseInput(input) {
    const pattern = /\[(.*?)\]/g;
    const matches = input.match(pattern);

    /**@todo  validation으로 대체 */
    if (!matches) {
      throw new Error(
        '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.'
      );
    }

    return matches.map((match) => {
      const [name, quantity] = match.slice(1, -1).split('-');
      return { name, quantity };
    });
  }

  async #initialize() {
    try {
      const productsData = await fileReader.readProductsFile();
      this.#products = new Products(productsData);
      this.#promotions = await fileReader.readPromotionsFile();
    } catch (error) {
      outputView.printErrorMessage(error);
      throw error;
    }
  }

  async #introduce() {
    outputView.printMessage(GAME_MESSAGES.INTRODUCE_PRODUCT_LIST);
  }
}

export default App;
