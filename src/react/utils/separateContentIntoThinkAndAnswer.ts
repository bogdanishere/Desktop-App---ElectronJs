import type { AssistantThinkOrAnswer, Conversation } from "./types";

/**
 * Funcție helper care primește un segment de text și parsează conținutul în blocuri
 * de tip AssistantThinkOrAnswer. Blocurile de cod sunt delimitate de triple backticks.
 */
function parseSegment(segment: string): AssistantThinkOrAnswer[] {
  const messages: AssistantThinkOrAnswer[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(segment)) !== null) {
    // Adaugă textul dinaintea blocului de cod (dacă există)
    if (match.index > lastIndex) {
      const textSegment = segment.slice(lastIndex, match.index).trim();
      if (textSegment) {
        messages.push({
          type: "text",
          content: textSegment,
        });
      }
    }
    const language = match[1] || undefined;
    const codeContent = match[2].trim();
    messages.push({
      type: "code",
      language,
      content: codeContent,
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  // Adaugă eventual textul rămas după ultimul bloc de cod
  if (lastIndex < segment.length) {
    const textSegment = segment.slice(lastIndex).trim();
    if (textSegment) {
      messages.push({
        type: "text",
        content: textSegment,
      });
    }
  }

  return messages;
}

/**
 * Funcția primește un string care conține blocuri think delimitate de
 * tag-urile <think> și </think>. Toate blocurile găsite sunt parsate separat,
 * iar tot ce se află după ultimul </think> este considerat secțiunea answer.
 */
export function separateContentIntoThinkAndAnswer(
  content: string,
  userQuestion: string
): Conversation {
  // Căutăm toate blocurile <think>...</think>
  const thinkMatches = Array.from(
    content.matchAll(/<think>([\s\S]*?)<\/think>/gi)
  );

  // Extragem segmentele din interiorul fiecărui tag <think>
  const thinkSegments = thinkMatches.map((match) => match[1].trim());

  // Tot ce se află după ultimul tag </think> este considerat answer
  let answerContent = "";
  const lastClosingTagIndex = content.lastIndexOf("</think>");
  if (lastClosingTagIndex !== -1) {
    answerContent = content
      .slice(lastClosingTagIndex + "</think>".length)
      .trim();
  }

  // Parsează fiecare segment think
  const thinkMessages = thinkSegments.flatMap((segment) =>
    parseSegment(segment)
  );
  // Parsează answer
  const answerMessages = parseSegment(answerContent);

  // Construim conversația cu un ChatPair
  const conversation: Conversation = [
    {
      id: crypto.randomUUID(),
      user: {
        type: "text",
        content: userQuestion,
      },
      assistant: {
        think: thinkMessages,
        answer: answerMessages,
      },
    },
  ];

  return conversation;
}
