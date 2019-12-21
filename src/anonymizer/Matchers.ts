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
    /(AIDS|VDRL|RPR|TPPA|TPHA|HSV)/g,
    /(abuse|addition|alcoholism|cannabis|hiv)/gi
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
