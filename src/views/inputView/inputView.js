//@ts-check

import { Console } from '@woowacourse/mission-utils';

const inputView = {
  /**
   * @param {string} message
   * @returns {Promise<string>}
   */
  async readUserInput(message) {
    return Console.readLineAsync(message);
  },
};

export default inputView;
