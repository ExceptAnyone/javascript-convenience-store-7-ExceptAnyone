//@ts-check
import { Console } from '@woowacourse/mission-utils';

export const outputView = {
  /**@param {string} message  */
  printMessage(message) {
    Console.print(message);
  },

  /**@param {Error} error */
  printErrorMessage(error) {
    outputView.printMessage(error.message);
  },
};

export default outputView;
