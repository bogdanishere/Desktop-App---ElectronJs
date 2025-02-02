import type { Fragment } from "./types";

export function parseThinkBlocks(content: string): Fragment[] {
  const pattern = /<think>([\s\S]*?)<\/think>/g;
  let lastIndex = 0;
  const fragments: Fragment[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    // match[1] e conținutul dintre <think> și </think>
    fragments.push({
      type: "think",
      content: match[1],
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    fragments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return fragments;
}
