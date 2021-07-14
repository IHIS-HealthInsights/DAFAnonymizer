export const TRANSFORM_TYPES: Record<string, string> = {
  NONE: "NONE",
  REMOVE: "REMOVE",
  ENCRYPT: "ENCRYPT",
  DECRYPT: "DECRYPT",
  DEIDENTIFY: "DE-IDENTIFY",
  TRUNCATE_RIGHT: "TRUNCATE_RIGHT",
  TRUNCATE_LEFT: "TRUNCATE_LEFT",
  SUPPRESS: "SUPPRESS_DATE_RANDOM",
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  // NAME: {
  //   display: "Name",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  IDENTIFIER: {
    display: "De-Identify",
    modeA: TRANSFORM_TYPES.DEIDENTIFY,
    modeB: TRANSFORM_TYPES.DEIDENTIFY,
  },
  // CONTACT: {
  //   display: "Contact Info",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  // MRN: {
  //   display: "Medical Record Number",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  // ADDRESS: {
  //   display: "Address",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  // ZIPCODE: {
  //   display: "Zipcode",
  //   modeA: TRANSFORM_TYPES.TRUNCATE_RIGHT,
  //   modeB: TRANSFORM_TYPES.TRUNCATE_RIGHT,
  // },
  // ACCOUNT_NO: {
  //   display: "Account Number",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  // NA now as we only accept CSV data
  // BIOMETRICS: {
  //   display: "Biometrics/Photographs",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE
  // },
  // URLS: {
  //   display: "URLS/Email",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE,
  // },
  // DATES: {
  //   display: "Dates (DOB/DOD/Others)",
  //   modeA: TRANSFORM_TYPES.SUPPRESS,
  //   modeB: TRANSFORM_TYPES.NONE,
  // },
  OTHER: {
    display: "Retain",
    modeA: TRANSFORM_TYPES.NONE,
    modeB: TRANSFORM_TYPES.NONE,
  },
  REMOVE: {
    display: "Remove",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE,
  },
};
