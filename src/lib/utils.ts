import type { MessageDeepseek } from "./types";

export async function chatWithDeepseek(
  messages: MessageDeepseek[]
): Promise<MessageDeepseek[]> {
  const { default: ollama } = await import("ollama");

  const response = await ollama.chat({
    model: "deepseek-r1:8b",
    messages: messages,
  });

  const newMessage = [
    ...messages,
    { role: "assistant", content: response.message.content } as const,
  ];

  return newMessage;
}
