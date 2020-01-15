import * as CryptoJS from "crypto-js";

export const generateRandomSalt = bytes =>
  CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(bytes));
