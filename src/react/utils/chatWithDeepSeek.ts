// import ollama from "ollama";
// import type { ChatPair, MessageDeepSeek } from "./types";
// import { separateContentIntoThinkAndAnswer } from "./separateContentIntoThinkAndAnswer";

// export type Conversation = ChatPair[];

// export async function chatWithDeepSeek(
//   mappingPageMessages: Conversation,
//   deepSeekFormMessages: MessageDeepSeek[]
// ): Promise<{ newConversation: Conversation; untouchedContent: string }> {
//   const response = (
//     await ollama.chat({
//       model: "deepseek-r1:8b",
//       messages: deepSeekFormMessages,
//     })
//   ).message.content;

//   const newConversation = separateContentIntoThinkAndAnswer(
//     response,
//     deepSeekFormMessages[deepSeekFormMessages.length - 1].content
//   );

//   return {
//     newConversation: [...mappingPageMessages, ...newConversation],
//     untouchedContent: response,
//   };
// }

declare global {
  interface Window {
    electronAPI: {
      chatDeepSeek: (
        mappingPageMessages: ChatPair[],
        deepSeekFormMessages: MessageDeepSeek[]
      ) => Promise<string>;
    };
  }
}

import type { ChatPair, MessageDeepSeek } from "./types";
import { separateContentIntoThinkAndAnswer } from "./separateContentIntoThinkAndAnswer";

export type Conversation = ChatPair[];

export async function chatWithDeepSeek(
  mappingPageMessages: Conversation,
  deepSeekFormMessages: MessageDeepSeek[]
): Promise<{ newConversation: Conversation; untouchedContent: string }> {
  const response = await window.electronAPI.chatDeepSeek(
    mappingPageMessages,
    deepSeekFormMessages
  );

  const newConversation = separateContentIntoThinkAndAnswer(
    response,
    deepSeekFormMessages[deepSeekFormMessages.length - 1].content
  );

  return {
    newConversation: [...mappingPageMessages, ...newConversation],
    untouchedContent: response,
  };
}
