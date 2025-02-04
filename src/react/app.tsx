// // import React, { useState } from "react";
// // import "./global.css";
// // import Send from "./Send";
// // import type { Conversation, MessageDeepSeek } from "./utils/types";
// // import { generateId } from "./utils/generateId";
// // import MarkdownMessage from "./MarkdownMessage";
// // import ButtonCopyCode from "./ButtonCopyCode";
// // import { chatWithDeepSeek } from "./utils/chatWithDeepSeek";

// // export default function App() {
// //   const [conversation, setConversation] = useState<Conversation>([]);

// //   const [deepSeekData, setDeepSeekData] = useState<MessageDeepSeek[]>([]);

// //   const [disableButton, setDisableButton] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     const formData = new FormData(e.target as HTMLFormElement);

// //     const input = formData.get("message") as string;

// //     (e.target as HTMLFormElement).reset();

// //     if (!input) return;

// //     setConversation((prev) => [
// //       ...prev,
// //       {
// //         id: generateId(),
// //         user: { type: "text", content: input },
// //       },
// //     ]);

// //     setDisableButton(true);

// //     const newUserMessage: MessageDeepSeek = {
// //       role: "user",
// //       content: input,
// //       id: generateId(),
// //     };

// //     const newDeepSeekData = [...deepSeekData, newUserMessage];

// //     setDeepSeekData(newDeepSeekData);

// //     const { newConversation, untouchedContent } = await chatWithDeepSeek(
// //       conversation,
// //       newDeepSeekData
// //     );

// //     setConversation(newConversation);

// //     setDeepSeekData((prev) => [
// //       ...prev,
// //       { role: "assistant", content: untouchedContent, id: generateId() },
// //     ]);

// //     setDisableButton(false);
// //   };

// //   return (
// //     <div className="chat-container">
// //       <div className="chat-card">
// //         <div className="chat-header">
// //           <h1 className="chat-title">OpenSource DeepSeek AI</h1>
// //         </div>
// //         <div className="chat-content">
// //           <div className="message-list">
// //             {conversation.map((pair) => (
// //               <React.Fragment key={pair.id}>
// //                 {/* Mesajul utilizatorului */}
// //                 <div className="message-wrapper user">
// //                   <MarkdownMessage content={pair.user.content} />
// //                 </div>
// //                 {/* Mesajul asistentului, dacă există */}
// //                 {pair.assistant && (
// //                   <div className="message-wrapper assistant">
// //                     <div className="content-ai">
// //                       {pair.assistant.think.map((msg, i) => (
// //                         <div key={i} className="message-think">
// //                           {i === 0 && (
// //                             <div className="message-think-title">
// //                               What is AI thinking?
// //                             </div>
// //                           )}
// //                           {msg.type === "text" ? (
// //                             <MarkdownMessage content={msg.content} />
// //                           ) : (
// //                             <code>
// //                               <pre>{msg.content}</pre>
// //                               <ButtonCopyCode code={msg.content} />
// //                             </code>
// //                           )}
// //                         </div>
// //                       ))}
// //                       {pair.assistant.answer.map((msg, i) => (
// //                         <div key={i} className="answer">
// //                           {msg.type === "text" ? (
// //                             <MarkdownMessage content={msg.content} />
// //                           ) : (
// //                             <code>
// //                               <pre>{msg.content}</pre>
// //                               <ButtonCopyCode code={msg.content} />
// //                             </code>
// //                           )}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
// //               </React.Fragment>
// //             ))}
// //           </div>
// //         </div>
// //         <div className="chat-footer">
// //           <form className="message-form" onSubmit={handleSubmit}>
// //             <input
// //               name="message"
// //               placeholder="Scrie un mesaj..."
// //               className="message-input"
// //             />
// //             <button
// //               type="submit"
// //               className="send-button"
// //               disabled={disableButton}
// //             >
// //               {disableButton ? "Loading..." : <Send />}
// //             </button>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

import React, { useState, useRef, useEffect } from "react";
import "./global.css";
import Send from "./Send";
import type { Conversation, MessageDeepSeek } from "./utils/types";
import { generateId } from "./utils/generateId";
import MarkdownMessage from "./MarkdownMessage";
import ButtonCopyCode from "./ButtonCopyCode";
import { chatWithDeepSeek } from "./utils/chatWithDeepSeek";

export default function App() {
  const [conversation, setConversation] = useState<Conversation>([]);
  const [deepSeekData, setDeepSeekData] = useState<MessageDeepSeek[]>([]);
  const [disableButton, setDisableButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, disableButton]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const input = formData.get("message") as string;
    (e.target as HTMLFormElement).reset();

    if (!input) return;

    setConversation((prev) => [
      ...prev,
      {
        id: generateId(),
        user: { type: "text", content: input },
      },
    ]);

    setDisableButton(true);

    const newUserMessage: MessageDeepSeek = {
      role: "user",
      content: input,
      id: generateId(),
    };

    const newDeepSeekData = [...deepSeekData, newUserMessage];
    setDeepSeekData(newDeepSeekData);

    const { newConversation, untouchedContent } = await chatWithDeepSeek(
      conversation,
      newDeepSeekData
    );

    setConversation(newConversation);

    setDeepSeekData((prev) => [
      ...prev,
      { role: "assistant", content: untouchedContent, id: generateId() },
    ]);

    setDisableButton(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-header">
          <h1 className="chat-title">OpenSource DeepSeek AI</h1>
        </div>
        <div className="chat-content">
          <div className="message-list">
            {conversation.map((pair) => (
              <React.Fragment key={pair.id}>
                {/* Mesajul utilizatorului */}
                <div className="message-wrapper user">
                  <MarkdownMessage content={pair.user.content} />
                </div>
                {/* Mesajul asistentului, dacă există */}
                {pair.assistant && (
                  <div className="message-wrapper assistant">
                    <div className="content-ai">
                      {pair.assistant.think.map((msg, i) => (
                        <div key={i} className="message-think">
                          {i === 0 && (
                            <div className="message-think-title">
                              What is AI thinking?
                            </div>
                          )}
                          {msg.type === "text" ? (
                            <MarkdownMessage content={msg.content} />
                          ) : (
                            <code>
                              <pre>{msg.content}</pre>
                              <ButtonCopyCode code={msg.content} />
                            </code>
                          )}
                        </div>
                      ))}
                      {pair.assistant.answer.map((msg, i) => (
                        <div key={i} className="answer">
                          {msg.type === "text" ? (
                            <MarkdownMessage content={msg.content} />
                          ) : (
                            <code>
                              <pre>{msg.content}</pre>
                              <ButtonCopyCode code={msg.content} />
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            {disableButton && (
              <div className="message-wrapper assistant">
                <div className="content-ai">
                  <div className="loading-message">
                    <div className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div ref={messagesEndRef} />
        <div className="chat-footer">
          <form className="message-form" onSubmit={handleSubmit}>
            <input
              name="message"
              placeholder="Scrie un mesaj..."
              className="message-input"
            />
            <button
              type="submit"
              className="send-button"
              disabled={disableButton}
            >
              {disableButton ? "Loading..." : <Send />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
