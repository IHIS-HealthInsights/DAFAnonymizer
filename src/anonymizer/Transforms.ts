import * as CryptoJS from "crypto-js";
import ANON_TYPES from "./AnonTypes";

const Transforms = {
  [ANON_TYPES.OTHER]: text => text,
  [ANON_TYPES.NRIC]: text => CryptoJS.AES.encrypt(text, "SECRET").toString(),
  [ANON_TYPES.NAME]: text => ""
};

export default Transforms;
