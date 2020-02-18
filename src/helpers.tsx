import * as CryptoJS from "crypto-js";

export const generateRandomSalt = bytes =>
  CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(bytes));

export const ascii_to_hex = str => {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
};

export const hex_to_ascii = str1 => {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

export const promptInt = (text: string, defaultInt?: number): number => {
  let i = NaN;
  while (Number.isNaN(i)) {
    i = parseInt(prompt(text, "" + (defaultInt || 0)));
  }
  return i;
};

export const promptString = (text: string, defaultStr?: string): string => {
  let s = "";
  while (s === null || s.length === 0) {
    s = prompt(text, defaultStr || "");
  }
  return s;
};
