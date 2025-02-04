import React, { useEffect, useState } from "react";
import { MarkdownMessageProps } from "./utils/types";
import { parseMarkdown } from "./utils/parseMarkdown";

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    parseMarkdown(content).then((result) => setHtml(result));
  }, [content]);

  return (
    <div
      className="markdown-message"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
