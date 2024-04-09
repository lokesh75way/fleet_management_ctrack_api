
export const Constant = {
  /**
   * Binary message header
   */
  BINARY_MSG_HEADER: 0x24, // '$'

  /**
   * Text message header
   */
  TEXT_MSG_HEADER: 0x28, // '('

  /**
   * Text message trailer
   */
  TEXT_MSG_TAIL: 0x29, // ')'

  /**
   * Text message separator
   */
  TEXT_MSG_SPLITER: 0x2C, // ','

  /**
   * Instructions for transparently transmitting binary data
   */
  WLNET_TYPE_LIST: ['5', '7']
};
