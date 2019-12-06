export type MatchResult = {
  start: number;
  end: number;
};

export interface Matcher {
  match: (text: string) => MatchResult[];
}

export class NricMatcher implements Matcher {
  regex = /([STFG]\d{7}[A-Z])/gi;
  match(text) {
    let matches = [];
    let m;
    while ((m = this.regex.exec(text)) !== null) {
      matches.push({ start: m.index, end: this.regex.lastIndex });
    }
    return matches;
  }
}
