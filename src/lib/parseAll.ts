import { parseCodeBlocks } from "./parseCodeBlocks";
import { parseThinkBlocks } from "./parseThinkBlocks";
import type { Fragment } from "./types";

export function parseAll(content: string): Fragment[] {
  const initialFragments = parseThinkBlocks(content);

  const finalFragments: Fragment[] = [];

  initialFragments.forEach((fragment) => {
    if (fragment.type === "text") {
      // pe bucata de text normal rulăm parseCodeBlocks
      const codeParsed = parseCodeBlocks(fragment.content);
      finalFragments.push(...codeParsed);
    } else {
      // 'think' rămâne cum e, 'code' n-ar trebui să apară încă
      finalFragments.push(fragment);
    }
  });

  return finalFragments;
}
