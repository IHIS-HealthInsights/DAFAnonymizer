export const TRANSFORM_TYPES: Record<string, string> = {
  NONE: "NONE",
  REMOVE: "REMOVE",
  PSEUDONYMIZE: "PSEUDONYMIZE",
  TRUNCATE_LAST_3: "TRUNCATE_LAST_3",
  SUPPRESS: "SUPPRESS_DATE_RANDOM",
  ENCRYPT: "ENCRYPT",
  DECRYPT: "DECRYPT"
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  NAME: {
    display: "Name",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  NRIC: {
    display: "NRIC",
    modeA: TRANSFORM_TYPES.PSEUDONYMIZE,
    modeB: TRANSFORM_TYPES.PSEUDONYMIZE
  },
  CONTACT: {
    display: "Contact Info",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  MRN: {
    display: "Medical Record Number",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  ADDRESS: {
    display: "Address",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  ZIPCODE: {
    display: "Zipcode",
    modeA: TRANSFORM_TYPES.TRUNCATE_LAST_3,
    modeB: TRANSFORM_TYPES.TRUNCATE_LAST_3
  },
  ACCOUNT_NO: {
    display: "Account Number",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  // NA now as we only accept CSV data
  // BIOMETRICS: {
  //   display: "Biometrics/Photographs",
  //   modeA: TRANSFORM_TYPES.REMOVE,
  //   modeB: TRANSFORM_TYPES.REMOVE
  // },
  URLS: {
    display: "URLS/Email",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  DATES: {
    display: "Dates (DOB/DOD/Others)",
    modeA: TRANSFORM_TYPES.SUPPRESS,
    modeB: TRANSFORM_TYPES.NONE
  }
};
