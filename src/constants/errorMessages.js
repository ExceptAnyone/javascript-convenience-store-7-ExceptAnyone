const ERROR_MESSAGES = Object.freeze({
  EMPTY_INPUT: '[ERROR] 구매 정보가 입력되지 않았습니다. 다시 입력해 주세요.',
  INVALID_FORMAT:
    '[ERROR] 구매 형식이 올바르지 않습니다. [상품명-수량] 형식으로 입력해 주세요.',
  EMPTY_NAME: '[ERROR] 상품명이 입력되지 않았습니다. 다시 입력해 주세요.',
  EMPTY_QUANTITY: '[ERROR] 수량이 입력되지 않았습니다. 다시 입력해 주세요.',
  NOT_INTEGER: '[ERROR] 수량은 정수로 입력해 주세요. (예: 1, 2, 3)',
  NEGATIVE_QUANTITY:
    '[ERROR] 수량은 1개 이상이어야 합니다. 다시 입력해 주세요.',
  DECIMAL_QUANTITY:
    '[ERROR] 수량은 소수점 없는 정수로 입력해 주세요. 다시 입력해 주세요.',
  PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
  INSUFFICIENT_STOCK:
    '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  INVALID_YES_NO: '[ERROR] Y 또는 N으로만 입력해 주세요. 다시 입력해 주세요.',
  INVALID_PROMOTION_PERIOD: '[ERROR] 현재 프로모션 기간이 아닙니다.',
  PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다.',
});

export { ERROR_MESSAGES };
