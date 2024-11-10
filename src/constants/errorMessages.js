const ERROR_MESSAGES = Object.freeze({
  EMPTY_INPUT: '[ERROR] 구매 정보가 입력되지 않았습니다.',
  INVALID_FORMAT:
    '[ERROR] 구매 형식이 올바르지 않습니다. [상품명-수량] 형식으로 입력해 주세요.',
  EMPTY_NAME: '[ERROR] 상품명이 입력되지 않았습니다.',
  EMPTY_QUANTITY: '[ERROR] 수량이 입력되지 않았습니다.',
  NOT_INTEGER: '[ERROR] 수량은 정수로 입력해 주세요. (예: 1, 2, 3)',
  NEGATIVE_QUANTITY: '[ERROR] 수량은 1개 이상이어야 합니다.',
  DECIMAL_QUANTITY: '[ERROR] 수량은 소수점 없는 정수로 입력해 주세요.',
});

export { ERROR_MESSAGES };
