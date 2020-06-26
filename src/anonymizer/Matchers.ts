export type MatchResult = {
  start: number;
  end: number;
};

export interface Matcher {
  match: (text: string) => MatchResult[];
  description: string;
}

export class NricMatcher implements Matcher {
  regex = /([STFG]\d{7}[A-Z])/gi;
  description = "Personally Indentifiable Information";
  match(text) {
    let matches = [];
    let m;
    while ((m = this.regex.exec(text)) !== null) {
      matches.push({ start: m.index, end: this.regex.lastIndex });
    }
    return matches;
  }
}

export class SHIMatcher implements Matcher {
  regexes = [
    // Case Sensitive
    /\b(AIDS|VDRL|RPR|TPPA|TPHA|HSV)\b/g,
    // Case Insensitive
    /\b(Abuse|Addiction|Alcoholic|Alcoholism|Amphetamine|Cannabis|Chancre|Chancroid|Chlamyd|Cocaine|Dependence|Ducreyi|Ecstasy|Gonococc|Gonor|Heroin|HIV|Marijuana|Opium|Pallid|Reagin|Retroviral|Spiroch|Sterilisation|Sterilization|Syphilis|Treponema|Trichomon|Urealyticum|Ureaplasma|Venereal|Withdraw|Tetraplex)\b/gi,
    // Multiple words
    /\b(C Trach|M genital|M hominis|N Gonor|Genital herpes|Herpes genital|Infect genital|Genital infect|Human immun|Sexual transmit|Transmit sexual|Herpes simple)\b/gi
  ];

  description = "Sensitive Health Information";
  match(text) {
    let matches = [];
    let m;
    for (const regex of this.regexes) {
      while ((m = regex.exec(text)) !== null) {
        matches.push({ start: m.index, end: regex.lastIndex });
      }
    }
    return matches;
  }
}

export class TelephoneMatcher implements Matcher {
  regex = /\b\d{4}[-.\s]??\d{4}\b/gi;
  description = "Telephone No";

  match(text) {
    let matches = [];
    let m;
    while ((m = this.regex.exec(text)) !== null) {
      matches.push({ start: m.index, end: this.regex.lastIndex });
    }
    return matches;
  }
}
