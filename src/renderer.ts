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
 * Tipurile de fragmente pe care vrem să le afișăm diferit.
 * 'think' => conținut între <think>...</think>
 * 'code'  => conținut între ```...```
 * 'text'  => orice altceva
 */
type FragmentType = "text" | "code" | "think";

type Fragment = {
  type: FragmentType;
  /** În cazul 'code', conține (optionally) limbajul detectat după ```lang */
  language?: string;
  /** Conținutul propriu-zis */
  content: string;
};

/**
 * Găsește toate fragmentele dintre <think>...</think> și le marchează
 * ca type: 'think'. Restul textului rămâne type: 'text'.
 *
 * Exemplu:
 * "Salut <think>gând</think> alt text"
 * -> [
 *    { type: 'text', content: 'Salut ' },
 *    { type: 'think', content: 'gând' },
 *    { type: 'text', content: ' alt text' }
 *   ]
 */
function parseThinkBlocks(content: string): Fragment[] {
  const pattern = /<think>([\s\S]*?)<\/think>/g;
  let lastIndex = 0;
  const fragments: Fragment[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    // match[1] e conținutul dintre <think> și </think>
    fragments.push({
      type: "think",
      content: match[1],
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    fragments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return fragments;
}

/**
 * Găsește blocurile de cod de forma:
 * ```lang
 *   <conținut>
 * ```
 * Returnează un array de fragmente (type: 'code' / 'text').
 *
 * Exemplu: "Hello ```js\nconsole.log('x')```" ->
 * [
 *   { type: 'text', content: 'Hello ' },
 *   { type: 'code', language: 'js', content: "console.log('x')" }
 * ]
 */
function parseCodeBlocks(content: string): Fragment[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const fragments: Fragment[] = [];
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    fragments.push({
      type: "code",
      language: match[1],
      content: match[2],
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    fragments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return fragments;
}

/**
 * parseAll - Combina logicile:
 * 1) Desparte întâi <think>...<think> => fragmente think/text
 * 2) Pentru fiecare fragment de tip 'text', mai căutăm blocuri de cod.
 *     => așa putem avea, de exemplu, <think>...</think> + ```...```
 * 3) Rezultatul final e un array de fragmente [ 'think', 'code', 'text' ]
 */
function parseAll(content: string): Fragment[] {
  const initialFragments = parseThinkBlocks(content);

  const finalFragments: Fragment[] = [];

  initialFragments.forEach((fragment) => {
    if (fragment.type === "text") {
      // pe bucata de text normal rulăm parseCodeBlocks
      const codeParsed = parseCodeBlocks(fragment.content);
      finalFragments.push(...codeParsed);
    } else {
      // 'think' rămâne cum e, 'code' n-ar trebui să apară încă
      finalFragments.push(fragment);
    }
  });

  return finalFragments;
}

// ------------------------------------------------
// Inițializăm elementele din DOM

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

const showMessages = document.createElement("div");
showMessages.style.height = "800px";
showMessages.style.overflow = "auto";
showMessages.style.border = "1px solid #ccc";
showMessages.style.marginTop = "1rem";
showMessages.style.padding = "0.5rem";

/**
 * Afișează toate mesajele din array-ul `messages`,
 * separând textul simplu, blocurile de cod și fragmentele <think>.
 */
function renderMessages(): void {
  showMessages.innerHTML = "";

  messages.forEach((message) => {
    // Containerul întregului mesaj (toate fragmentele + titlul de rol)
    const messageContainer = document.createElement("div");
    messageContainer.style.marginBottom = "0.5rem";

    // Creăm titlul cu rolul expeditorului
    const roleLabel = document.createElement("div");
    roleLabel.textContent = message.role.toUpperCase();
    roleLabel.style.fontWeight = "bold";
    roleLabel.style.marginBottom = "0.3rem";

    // În funcție de rol se aplică stilurile de aliniere și culoare
    if (message.role === "user") {
      roleLabel.style.textAlign = "right";
      roleLabel.style.color = "green";
    } else {
      roleLabel.style.textAlign = "left";
      roleLabel.style.color = "blue";
    }

    // Adăugăm titlul în containerul mesajului
    messageContainer.appendChild(roleLabel);

    // Se obțin fragmentele din conținut (text, code, think)
    const fragments = parseAll(message.content);

    // Pentru fiecare fragment se creează un container separat
    fragments.forEach((fragment) => {
      // Dacă fragmentul de tip think este gol, nu-l afișăm
      if (fragment.type === "think" && fragment.content.trim().length === 0) {
        return;
      }

      const wrapper = document.createElement("div");
      // Setăm aceeași aliniere și culoare ca la titlu
      if (message.role === "user") {
        wrapper.style.textAlign = "right";
        wrapper.style.color = "green";
      } else {
        wrapper.style.textAlign = "left";
        wrapper.style.color = "blue";
      }
      wrapper.style.margin = "0.2rem 0";

      switch (fragment.type) {
        case "text":
          // Text simplu
          wrapper.innerText = fragment.content;
          break;

        case "code": {
          // Bloc de cod cu buton de copiere
          const copyBtn = document.createElement("button");
          copyBtn.innerText = "Copy code";
          copyBtn.style.position = "absolute";
          copyBtn.style.top = "6px"; // Reduce distanța față de top
          copyBtn.style.right = "6px"; // Reduce distanța față de marginea dreaptă
          copyBtn.style.padding = "4px 8px"; // Ajustează paddingul butonului
          copyBtn.style.fontSize = "12px"; // Reduce dimensiunea fontului pentru a se potrivi mai bine
          copyBtn.style.background = "green";
          copyBtn.style.color = "white";
          copyBtn.style.border = "none";
          copyBtn.style.borderRadius = "5px";
          copyBtn.style.cursor = "pointer";
          copyBtn.style.zIndex = "2"; // Asigură că butonul este deasupra codului

          copyBtn.onclick = () => {
            navigator.clipboard.writeText(fragment.content);
            copyBtn.innerText = "Copied!";
          };

          const pre = document.createElement("pre");
          pre.style.position = "relative";
          pre.style.margin = "0 1rem";
          pre.style.paddingTop = "0.5rem"; // Menține un spațiu mic pentru buton
          pre.style.background = "#f9f9f9"; // Fundal mai prietenos pentru cod
          pre.style.border = "1px solid black";
          pre.style.borderRadius = "5px";
          pre.style.overflow = "auto"; // Scroll pentru cod lung

          const code = document.createElement("code");
          code.style.display = "block";
          code.style.padding = "8px";
          code.style.whiteSpace = "pre-wrap";
          code.textContent = fragment.content;

          pre.appendChild(copyBtn); // Butonul este primul pentru a fi deasupra codului
          pre.appendChild(code);
          wrapper.appendChild(pre);
          break;
        }

        case "think": {
          // Creăm un container pentru fragmentele de tip <think>
          const thinkContainer = document.createElement("div");
          thinkContainer.style.border = "1px solid #8f008f";
          thinkContainer.style.padding = "6px";
          thinkContainer.style.background = "rgb(73, 148, 167)";
          thinkContainer.style.color = "black";

          const h1 = document.createElement("h1");
          h1.textContent = "What is the AI thinking?";
          h1.style.paddingBottom = "9px"; // spațiu sub titlu

          const thinkText = document.createElement("div");
          thinkText.textContent = fragment.content;

          thinkContainer.appendChild(h1);
          thinkContainer.appendChild(thinkText);

          wrapper.appendChild(thinkContainer);
          break;
        }
      }

      // Adăugăm fiecare fragment în containerul mesajului
      messageContainer.appendChild(wrapper);
    });

    // Containerul mesajului se adaugă în zona de afișare
    showMessages.appendChild(messageContainer);
  });

  // Scroll la finalul zonei de mesaje
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
