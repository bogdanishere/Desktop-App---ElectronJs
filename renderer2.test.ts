type MessageDeepseek = {
  role: "user" | "system" | "assistant";
  content: string;
};

/**
 * Apelează API-ul Ollama cu mesajele curente
 * și întoarce un nou array de mesaje cu răspunsul asistentului.
 */
async function chatWithDeepseek(
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

/**
 * Definim un tip pentru fragment (text sau bloc de cod).
 */
type Fragment = {
  type: "text" | "code";
  language?: string; // ex: "jsx", "ts", etc.
  content: string;
};

/**
 * Funcție care caută în string fragmentele de tip ```lang\n ... \n```
 * și le returnează ca array de Fragmente (text sau cod).
 */
function parseCodeBlocks(content: string): Fragment[] {
  // Regex care prinde: ```urmat de (limba, ex: jsx), newline,
  // conținut multiline până la următorul ```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const fragments: Fragment[] = [];
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // match.index -> poziția din string unde a început match-ul
    if (match.index > lastIndex) {
      // Adăugăm textul de dinaintea blocului de cod
      fragments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // match[1] este limba (ex: "jsx")
    // match[2] este conținutul blocului de cod
    fragments.push({
      type: "code",
      language: match[1],
      content: match[2],
    });

    // actualizăm lastIndex la finalul blocului
    lastIndex = codeBlockRegex.lastIndex;
  }

  // Dacă a mai rămas text după ultimul bloc de cod
  if (lastIndex < content.length) {
    fragments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return fragments;
}

// ------------------------------------------------
// Inițializăm elementele din DOM

const body = document.querySelector("body");
if (!body) {
  throw new Error("Nu a fost găsit <body> în document.");
}

const header = document.createElement("h1");
header.innerText = "Welcome to Deepseek Chat";

let messages: MessageDeepseek[] = [];
let loading = false;

const form = document.createElement("form");
form.style.display = "flex";
form.style.justifyContent = "space-between";
form.style.alignItems = "center";
form.style.marginTop = "1rem";
form.style.width = "100%";
form.style.maxWidth = "800px";
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

const showMessages = document.createElement("div");
showMessages.style.height = "800px";
showMessages.style.overflow = "auto";
showMessages.style.border = "1px solid #ccc";
showMessages.style.marginTop = "1rem";
showMessages.style.padding = "0.5rem";

/**
 * Afișează toate mesajele din array-ul `messages`,
 * separând textul simplu de blocurile de cod și
 * stilizându-le diferit.
 */
function renderMessages(): void {
  showMessages.innerHTML = "";

  messages.forEach((message) => {
    // Pentru fiecare mesaj, despărțim conținutul în fragmente
    const fragments = parseCodeBlocks(message.content);

    fragments.forEach((fragment) => {
      // Pentru a controla alinierea și culoarea,
      // creăm un wrapper general (ex: <div>)
      const wrapper = document.createElement("div");

      // În funcție de tipul fragmentului (text / cod), punem alt HTML
      if (fragment.type === "text") {
        // Text obișnuit
        wrapper.innerText = fragment.content;
      } else if (fragment.type === "code") {
        // Creăm un <pre><code> pentru cod + un buton de copiere
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        const copyBtn = document.createElement("button");

        // Butonul de copiere
        copyBtn.innerText = "Copiază codul";
        copyBtn.style.marginBottom = "4px";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(fragment.content);
        };

        // Stil pentru <code> (border, background, culoare text)
        code.style.display = "block";
        code.style.border = "1px solid black";
        code.style.background = "#f9f9f9";
        code.style.color = "black";
        code.style.padding = "8px";
        code.style.whiteSpace = "pre-wrap"; // să nu iasă din container

        // Setăm textul codului în <code>
        code.textContent = fragment.content;

        // Adăugăm ordinea: buton -> <pre><code>
        pre.appendChild(code);

        // Afișarea finală în wrapper
        wrapper.appendChild(copyBtn);
        wrapper.appendChild(pre);
      }

      // Stilul diferă în funcție de rol
      if (message.role === "user") {
        wrapper.style.textAlign = "right";
        wrapper.style.color = "green";
      } else {
        // system sau assistant
        wrapper.style.textAlign = "left";
        wrapper.style.color = "blue";
      }

      wrapper.style.margin = "0.5rem 0";
      showMessages.appendChild(wrapper);
    });
  });

  // Facem scroll automat la final
  showMessages.scrollTop = showMessages.scrollHeight;
}

/**
 * Actualizează starea butonului „Send” în funcție de `loading`.
 */
function updateButtonText(): void {
  button.innerText = loading ? "Loading..." : "Send";
  button.disabled = loading;
}

/**
 * Este apelat când se dă click pe buton (sau Enter).
 * Trimite textul user-ului la API și așteaptă răspuns.
 */
async function handleButtonAction(): Promise<void> {
  if (loading) return;

  const text = input.value.trim();
  if (!text) return;

  loading = true;
  updateButtonText();

  messages.push({ role: "user", content: text });
  input.value = "";

  // Reafișăm mesajele cu textul userului
  renderMessages();

  try {
    // Așteptăm răspunsul de la model
    const newMessages = await chatWithDeepseek(messages);
    messages = newMessages;
  } catch (error) {
    console.error(error);
    messages = [...messages, { role: "system", content: "Error occurred" }];
  } finally {
    loading = false;
    updateButtonText();
  }

  // Afișăm mesajele (inclusiv ce a generat asistentul)
  renderMessages();
}

// ------------------------------------------------
// Legăm totul în pagina HTML

form.appendChild(input);
form.appendChild(button);

body.appendChild(header);
body.appendChild(form);
body.appendChild(showMessages);

// Când se apasă Enter pe tastatură, trimitem mesajul
body.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleButtonAction();
  }
});

// Când se apasă pe butonul "Send"
button.onclick = () => handleButtonAction();

updateButtonText(); // Inițializare buton
