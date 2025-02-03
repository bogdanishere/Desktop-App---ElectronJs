import { marked } from "marked";

function preprocessMarkdown(content: string): string {
  return content.replace(/(\S)\s+(#{3,})\s+/g, "$1\n$2 ");
}

export async function parseMarkdown(content: string): Promise<string> {
  const preprocessedContent = preprocessMarkdown(content);
  return Promise.resolve(marked.parse(preprocessedContent));
}
