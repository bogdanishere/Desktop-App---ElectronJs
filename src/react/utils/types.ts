export type MessageDeepSeek = {
  role: "user" | "system" | "assistant";
  content: string;
  id: string;
};

export type AssistantThinkOrAnswer = {
  type: "text" | "code";
  language?: string;
  content: string;
};

export type UserMessage = Omit<AssistantThinkOrAnswer, "language">;

export type ChatPair = {
  id: string;
  user: UserMessage;
  assistant?: {
    think: AssistantThinkOrAnswer[];
    answer: AssistantThinkOrAnswer[];
  };
};

export type Conversation = ChatPair[];

export type MarkdownMessageProps = {
  content: string;
};
