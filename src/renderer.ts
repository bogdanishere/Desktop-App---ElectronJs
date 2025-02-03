import { parseAll } from "./lib/parseAll";
import { parseMarkdown } from "./lib/parseMarkdown";
import { chatWithDeepseek } from "./lib/utils";

import type { MessageDeepseek } from "./lib/types";

let messages: MessageDeepseek[] = []; // Declare messages variable

const body = document.querySelector("body");

if (!body) {
  throw new Error("Nu a fost găsit <body> în document.");
}

body.style.maxWidth = "800px";
body.style.margin = "auto";
body.style.backgroundColor = "#e5e7eb";

// Add a modern font and smooth scrolling
document.documentElement.style.fontFamily = "'Inter', system-ui, sans-serif";
document.documentElement.style.scrollBehavior = "smooth";

const header = document.createElement("h1");
header.innerText = "Welcome to Deepseek Chat";
header.style.textAlign = "center";
header.style.color = "#1a1a1a";
header.style.fontWeight = "800";
header.style.transition = "color 0.3s ease";

// Add hover effect to header
header.onmouseover = () => (header.style.color = "#4a9eff");
header.onmouseout = () => (header.style.color = "#1a1a1a");

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
input.style.padding = "12px";
input.style.border = "2px solid #e1e1e1";
input.style.borderRadius = "8px";
input.style.backgroundColor = "#f8f9fa";
input.style.transition = "all 0.3s ease";

// Add focus effect to input
input.onfocus = () => {
  input.style.borderColor = "#4a9eff";
};
input.onblur = () => {
  input.style.borderColor = "#e1e1e1";
};

const button = document.createElement("button");
button.innerText = "Send";
button.type = "button";
button.style.backgroundColor = "#4a9eff";
button.style.color = "white";
button.style.border = "none";
button.style.borderRadius = "8px";
button.style.padding = "12px 24px";
button.style.cursor = "pointer";
button.style.transition = "all 0.3s ease";
button.style.fontWeight = "600";

// Add hover effect to button
button.onmouseover = () => (button.style.backgroundColor = "#2b7fdb");
button.onmouseout = () => (button.style.backgroundColor = "#4a9eff");

const showMessages = document.createElement("div");
showMessages.style.height = "800px";
showMessages.style.overflow = "auto";
showMessages.style.border = "2px solid #e1e1e1";
showMessages.style.borderRadius = "12px";
showMessages.style.marginTop = "1rem";
showMessages.style.padding = "1rem";
showMessages.style.backgroundColor = "#f4f4f5";
showMessages.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";

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

let loading = false; // Declare loading variable

function renderMessages(): void {
  showMessages.innerHTML = "";

  messages.forEach((message) => {
    const messageContainer = document.createElement("div");
    messageContainer.style.marginBottom = "1rem";
    messageContainer.style.animation = "fadeIn 0.3s ease-in-out";

    const roleLabel = document.createElement("div");
    roleLabel.textContent = message.role.toUpperCase();
    roleLabel.style.fontWeight = "700";
    roleLabel.style.marginBottom = "0.5rem";
    roleLabel.style.transition = "all 0.3s ease";

    if (message.role === "user") {
      roleLabel.style.textAlign = "right";
      roleLabel.style.color = "#6b7280";
    } else {
      roleLabel.style.textAlign = "left";
      roleLabel.style.color = "#3b82f6";
    }

    messageContainer.appendChild(roleLabel);

    const fragments = parseAll(message.content);
    (async () => {
      for (const fragment of fragments) {
        if (fragment.type === "think" && fragment.content.trim().length === 0) {
          continue;
        }

        const wrapper = document.createElement("div");

        if (message.role === "user") {
          wrapper.style.textAlign = "right";
          wrapper.style.color = "#15803d";
        } else {
          wrapper.style.textAlign = "left";
          wrapper.style.color = "#1d4ed8";
        }
        wrapper.style.margin = "0.5rem 0";
        wrapper.style.transition = "all 0.3s ease";

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
            copyBtn.style.top = "8px";
            copyBtn.style.right = "8px";
            copyBtn.style.padding = "6px 12px";
            copyBtn.style.fontSize = "12px";
            copyBtn.style.backgroundColor = "#22c55e";
            copyBtn.style.color = "white";
            copyBtn.style.border = "none";
            copyBtn.style.borderRadius = "6px";
            copyBtn.style.cursor = "pointer";
            copyBtn.style.transition = "all 0.3s ease";
            copyBtn.style.zIndex = "2";

            copyBtn.onmouseover = () =>
              (copyBtn.style.backgroundColor = "#15803d");
            copyBtn.onmouseout = () =>
              (copyBtn.style.backgroundColor = "#22c55e");

            const pre = document.createElement("pre");
            pre.style.position = "relative";
            pre.style.margin = "0.5rem";
            pre.style.padding = "1rem";
            pre.style.backgroundColor = "#f8fafc";
            pre.style.border = "1px solid #e2e8f0";
            pre.style.borderRadius = "8px";
            pre.style.overflow = "auto";

            const code = document.createElement("code");
            code.style.display = "block";
            code.style.padding = "12px";
            code.style.whiteSpace = "pre-wrap";
            code.style.fontFamily = "'Fira Code', monospace";
            code.textContent = fragment.content;

            pre.appendChild(copyBtn);
            pre.appendChild(code);
            wrapper.appendChild(pre);
            break;
          }

          case "think": {
            const thinkContainer = document.createElement("div");
            thinkContainer.style.border = "2px solid #c084fc";
            thinkContainer.style.padding = "1rem";
            thinkContainer.style.backgroundColor = "#f3e8ff";
            thinkContainer.style.color = "#6b21a8";
            thinkContainer.style.borderRadius = "8px";
            thinkContainer.style.transition = "all 0.3s ease";
            thinkContainer.style.animation = "slideIn 0.3s ease-in-out";

            const h1 = document.createElement("h1");
            h1.textContent = "What is the AI thinking?";
            h1.style.paddingBottom = "0.75rem";
            h1.style.fontSize = "1.25rem";
            h1.style.fontWeight = "700";
            h1.style.color = "#7c3aed";

            const thinkText = document.createElement("div");

            thinkText.innerHTML = await parseMarkdown(fragment.content);
            thinkText.style.fontSize = "1rem";
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

// Add animations to the document
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);
