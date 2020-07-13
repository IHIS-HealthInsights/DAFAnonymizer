export type MatchResult = {
  start: number;
  end: number;
};

export class Matcher {
  regexes: RegExp[];
  description: string;
  redactString: string;
  match(text: string): MatchResult[] {
    let matches = [];
    let m;
    for (const regex of this.regexes) {
      while ((m = regex.exec(text)) !== null) {
        matches.push({ start: m.index, end: regex.lastIndex });
      }
    }
    return matches;
  }
  redact(text: string): string {
    let redacted = text;
    for (const regex of this.regexes) {
      redacted = redacted.replace(regex, this.redactString);
    }
    return redacted;
  }
}

export class NricMatcher extends Matcher {
  regexes = [/\b([STFG]\d{7}[A-Z])\b/gi];
  description = "Personally Indentifiable Information";
  redactString = "[NRIC/FIN]";
}

export class SHIMatcher extends Matcher {
  regexes = [
    // Case Sensitive
    /\b(AIDS|VDRL|RPR|TPPA|TPHA|HSV)\b/g,
    // Case Insensitive
    /\b(Abuse|Addiction|Alcoholic|Alcoholism|Amphetamine|Cannabis|Chancre|Chancroid|Chlamyd|Cocaine|Dependence|Ducreyi|Ecstasy|Gonococc|Gonor|Heroin|HIV|Marijuana|Opium|Pallid|Reagin|Retroviral|Spiroch|Sterilisation|Sterilization|Syphilis|Treponema|Trichomon|Urealyticum|Ureaplasma|Venereal|Withdraw|Tetraplex)\b/gi,
    // Multiple words
    /\b(C Trach|M genital|M hominis|N Gonor|Genital herpes|Herpes genital|Infect genital|Genital infect|Human immun|Sexual transmit|Transmit sexual|Herpes simple)\b/gi,
  ];
  description = "Sensitive Health Information";
  redactString = "[SHI]";
}

export class TelephoneMatcher extends Matcher {
  regexes = [/\b[689]\d{3}[-.\s]??\d{4}\b/gi];
  description = "Telephone No";
  redactString = "[TelephoneNo]";
}
