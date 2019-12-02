export const ANON_TYPES: Record<string, string> = {
  REMOVE: "REMOVE",
  ENCRYPT: "ENCRYPT",
  TRUNCATE: "TRUNCATE",
  SUPPRESS: "SUPPRESS",
  NONE: "NONE"
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  NAME: { display: "Name", modeA: ANON_TYPES.REMOVE, modeB: ANON_TYPES.REMOVE },
  NRIC: {
    display: "NRIC",
    modeA: ANON_TYPES.ENCRYPT,
    modeB: ANON_TYPES.ENCRYPT
  },
  CONTACT: {
    display: "Contact Info",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  MRN: {
    display: "Medical Record Number",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  ADDRESS: {
    display: "Address",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  ZIPCODE: {
    display: "Zipcode",
    modeA: ANON_TYPES.TRUNCATE,
    modeB: ANON_TYPES.TRUNCATE
  },
  ACCOUNT_NO: {
    display: "Account Number",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  BIOMETRICS: {
    display: "Biometrics/Photographs",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  URLS: {
    display: "URLs/EMAIL",
    modeA: ANON_TYPES.REMOVE,
    modeB: ANON_TYPES.REMOVE
  },
  DOB: {
    display: "Date of Birth",
    modeA: ANON_TYPES.SUPPRESS,
    modeB: ANON_TYPES.NONE
  },
  DOD: {
    display: "Date of Death",
    modeA: ANON_TYPES.SUPPRESS,
    modeB: ANON_TYPES.NONE
  },
  OTHERDATES: {
    display: "Other Dates",
    modeA: ANON_TYPES.SUPPRESS,
    modeB: ANON_TYPES.NONE
  }
};
