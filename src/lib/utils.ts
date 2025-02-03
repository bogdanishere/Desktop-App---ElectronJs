import type { MessageDeepseek } from "./types";
import ollama from "ollama";

export async function chatWithDeepseek(
  messages: MessageDeepseek[]
): Promise<MessageDeepseek[]> {
  console.log("chatWithDeepseek", messages);
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
