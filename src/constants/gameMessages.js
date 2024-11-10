const GAME_MESSAGES = Object.freeze({
  INTRODUCE_PRODUCT_LIST:
    '안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n',
  ENTER_PRODUCT_INFO:
    '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
  ASK_MEMBERSHIP: '\n멤버십 할인을 적용하시겠습니까? (Y/N)\n',
  ASK_CONTINUE_SHOPPING: '\n추가 구매하시겠습니까? (Y/N)\n',
  PROMOTION_GIFT_MESSAGE:
    '현재 {productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n',
  PARTIAL_PROMOTION_MESSAGE:
    '현재 {productName} {quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n',
  NON_PROMOTIONAL_PURCHASE_MESSAGE:
    '현재 {productName} {quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n',
});

export { GAME_MESSAGES };
