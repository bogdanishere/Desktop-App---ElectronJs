import type { Fragment } from "./types";

export function parseCodeBlocks(content: string): Fragment[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const fragments: Fragment[] = [];
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    fragments.push({
      type: "code",
      language: match[1],
      content: match[2],
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    fragments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return fragments;
}
