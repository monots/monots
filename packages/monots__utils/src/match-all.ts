interface MatchResult {
  /**
   * The named specifiers within the captured match result.
   */
  named: Record<string, string>;

  /**
   * The unnamed specifiers within the captured match result. The first unnamed capture has an index of 0.
   */
  unnamed: string[];

  /**
   * The full match result.
   */
  code: string;

  /**
   * The starting index of the matching result.
   */
  start: number;

  /**
   * The ending index of the matching result.
   */
  end: number;
}

interface MatchAll {
  /**
   * The regex which determines the matches.
   */
  regex: RegExp;

  /**
   * The content to search for matches.
   */
  content: string;
}

/**
 * Find every named capture group and unnamed capture group in the given string.
 */
export function matchAll(props: MatchAll): MatchResult[] {
  const { regex, content } = props;
  const matches: MatchResult[] = [];

  for (const match of content.matchAll(regex)) {
    const [code = '', ...unnamed] = match;
    const start = match.index ?? 0;
    const end = start + code.length;
    const named = match.groups ?? {};

    matches.push({ code, unnamed: unnamed, start, end, named: named });
  }

  return matches;
}
