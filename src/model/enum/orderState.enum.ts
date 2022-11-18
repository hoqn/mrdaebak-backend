export enum OrderState {
    CART = 0x00,
    HOLD = 0x08,
    WAITING = 0x10,
    COOKING = 0x21,
    IN_DELIVERY = 0x22,
    DONE = 0xFF,
  }