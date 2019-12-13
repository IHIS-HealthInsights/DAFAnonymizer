export const TRANSFORM_TYPES: Record<string, string> = {
  REMOVE: "REMOVE",
  PSEUDONYMIZE: "PSEUDONYMIZE",
  TRUNCATE: "TRUNCATE",
  SUPPRESS: "SUPPRESS",
  NONE: "NONE"
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
    modeA: TRANSFORM_TYPES.TRUNCATE,
    modeB: TRANSFORM_TYPES.TRUNCATE
  },
  ACCOUNT_NO: {
    display: "Account Number",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  BIOMETRICS: {
    display: "Biometrics/Photographs",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  URLS: {
    display: "URLs/EMAIL",
    modeA: TRANSFORM_TYPES.REMOVE,
    modeB: TRANSFORM_TYPES.REMOVE
  },
  DOB: {
    display: "Date of Birth",
    modeA: TRANSFORM_TYPES.SUPPRESS,
    modeB: TRANSFORM_TYPES.NONE
  },
  DOD: {
    display: "Date of Death",
    modeA: TRANSFORM_TYPES.SUPPRESS,
    modeB: TRANSFORM_TYPES.NONE
  },
  OTHERDATES: {
    display: "Other Dates",
    modeA: TRANSFORM_TYPES.SUPPRESS,
    modeB: TRANSFORM_TYPES.NONE
  }
};
