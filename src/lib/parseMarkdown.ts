function preprocessMarkdown(content: string): string {
  return content.replace(/(\S)\s+(#{3,})\s+/g, "$1\n$2 ");
}

export async function parseMarkdown(content: string): Promise<string> {
  const preprocessedContent = preprocessMarkdown(content);
  const marked = await import("marked");
  return Promise.resolve(marked.parse(preprocessedContent));
}
