import { parseAll } from "./lib/parseAll";
import { parseMarkdown } from "./lib/parseMarkdown";
import { chatWithDeepseek } from "./lib/utils";

import type { MessageDeepseek } from "./lib/types";

const body = document.querySelector("body");

if (!body) {
  throw new Error("Nu a fost găsit <body> în document.");
}

const header = document.createElement("h1");
header.innerText = "Welcome to Deepseek Chat";
header.style.textAlign = "center";

let messages: MessageDeepseek[] = [];
let loading = false;

const form = document.createElement("form");
form.style.display = "flex";
form.style.justifyContent = "space-between";
form.style.alignItems = "center";
form.style.marginTop = "1rem";
form.style.width = "100%";
form.style.margin = "auto";
form.style.gap = "45px";
form.onsubmit = (event) => event.preventDefault();

const input = document.createElement("input");
input.type = "text";
input.placeholder = "Type here";
input.style.flexGrow = "1";

const button = document.createElement("button");
button.innerText = "Send";
button.type = "button";
button.onclick = () => handleButtonAction();

const showMessages = document.createElement("div");
showMessages.style.height = "800px";
showMessages.style.overflow = "auto";
showMessages.style.border = "1px solid #ccc";
showMessages.style.marginTop = "1rem";
showMessages.style.padding = "0.5rem";

// append all elements to the body

form.appendChild(input);
form.appendChild(button);

body.appendChild(header);
body.appendChild(form);
body.appendChild(showMessages);

body.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleButtonAction();
  }
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
///////////// FUNCTIONS ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

function renderMessages(): void {
  showMessages.innerHTML = "";

  messages.forEach((message) => {
    const messageContainer = document.createElement("div");
    messageContainer.style.marginBottom = "0.5rem";

    const roleLabel = document.createElement("div");
    roleLabel.textContent = message.role.toUpperCase();
    roleLabel.style.fontWeight = "bold";
    roleLabel.style.marginBottom = "0.3rem";

    if (message.role === "user") {
      roleLabel.style.textAlign = "right";
      roleLabel.style.color = "green";
    } else {
      roleLabel.style.textAlign = "left";
      roleLabel.style.color = "blue";
    }

    messageContainer.appendChild(roleLabel);

    const fragments = parseAll(message.content);
    console.log(fragments);

    (async () => {
      for (const fragment of fragments) {
        if (fragment.type === "think" && fragment.content.trim().length === 0) {
          continue;
        }

        const wrapper = document.createElement("div");

        if (message.role === "user") {
          wrapper.style.textAlign = "right";
          wrapper.style.color = "green";
        } else {
          wrapper.style.textAlign = "left";
          wrapper.style.color = "blue";
        }
        wrapper.style.margin = "0.2rem 0";

        switch (fragment.type) {
          case "text": {
            const parsedText = await parseMarkdown(fragment.content);
            wrapper.innerHTML = parsedText;
            break;
          }

          case "code": {
            const copyBtn = document.createElement("button");
            copyBtn.innerText = "Copy code";
            copyBtn.style.position = "absolute";
            copyBtn.style.top = "6px";
            copyBtn.style.right = "6px";
            copyBtn.style.padding = "4px 8px";
            copyBtn.style.fontSize = "12px";
            copyBtn.style.background = "green";
            copyBtn.style.color = "white";
            copyBtn.style.border = "none";
            copyBtn.style.borderRadius = "5px";
            copyBtn.style.cursor = "pointer";
            copyBtn.style.zIndex = "2";

            copyBtn.onclick = () => {
              navigator.clipboard.writeText(fragment.content);
              copyBtn.innerText = "Copied!";
            };

            const pre = document.createElement("pre");
            pre.style.position = "relative";
            pre.style.margin = "0 1rem";
            pre.style.paddingTop = "0.5rem";
            pre.style.background = "#f9f9f9";
            pre.style.border = "1px solid black";
            pre.style.borderRadius = "5px";
            pre.style.overflow = "auto";

            const code = document.createElement("code");
            code.style.display = "block";
            code.style.padding = "8px";
            code.style.whiteSpace = "pre-wrap";
            code.textContent = fragment.content;

            pre.appendChild(copyBtn);
            pre.appendChild(code);
            wrapper.appendChild(pre);
            break;
          }

          case "think": {
            const thinkContainer = document.createElement("div");
            thinkContainer.style.border = "1px solid #8f008f";
            thinkContainer.style.padding = "6px";
            thinkContainer.style.background = "rgb(73, 148, 167)";
            thinkContainer.style.color = "black";

            const h1 = document.createElement("h1");
            h1.textContent = "What is the AI thinking?";
            h1.style.paddingBottom = "9px";

            const thinkText = document.createElement("div");
            thinkText.innerHTML = fragment.content.replace(/\n/g, "<br>");

            thinkContainer.appendChild(h1);
            thinkContainer.appendChild(thinkText);

            wrapper.appendChild(thinkContainer);
            break;
          }
        }

        messageContainer.appendChild(wrapper);
      }
    })();

    showMessages.appendChild(messageContainer);
  });

  showMessages.scrollTop = showMessages.scrollHeight;
}

function updateButtonText() {
  button.innerText = loading ? "Loading..." : "Send";
  button.disabled = loading;
}

async function handleButtonAction(): Promise<void> {
  if (loading) return;

  const text = input.value.trim();
  if (!text) return;

  loading = true;
  updateButtonText();

  messages.push({ role: "user", content: text });
  input.value = "";

  renderMessages();

  try {
    const newMessages = await chatWithDeepseek(messages);
    messages = newMessages;
  } catch (error) {
    console.error(error);
    messages = [...messages, { role: "system", content: "Error occurred" }];
  } finally {
    loading = false;
    updateButtonText();
  }

  renderMessages();
}
console.log("Hello from renderer.ts");
