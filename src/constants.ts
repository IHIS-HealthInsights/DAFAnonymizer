import * as CryptoJS from "crypto-js";
export const DEFAULT_KVALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
export const FIXED_IV = CryptoJS.enc.Hex.parse(
  "101112131415161718191a1b1c1d1e1f"
);
