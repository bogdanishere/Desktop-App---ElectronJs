# Open Source Electron Chat

**Desktop Chat Application That Uses Local AI Models for Enhanced Privacy**

## Installation

### Prerequisites

Before installing the application, ensure that you have **Ollama** installed locally.

- **Install Ollama:**
  - Visit the [Ollama Download Page](https://ollama.com/download) and follow the installation instructions.
  - After installing, run the following command to start the DeepSeek model:
    ```bash
    ollama run deepseek-r1:8b
    ```
  - **Note:** This model is based on your PC's performance. If you believe your system might not handle this model well, please choose a different model from the [Ollama DeepSeek Library](https://ollama.com/library/deepseek-r1) and update the model name in the main code accordingly.

### Update the Model in the Code

In the `main.ts` file, locate the IPC handler and update the model name if needed:

```typescript
ipcMain.handle("chat-deepseek", async (event, args) => {
  const { deepSeekFormMessages } = args;
  // Ollama Chat
  const response = await ollama.chat({
    model: "deepseek-r1:8b", // Change the model name here based on the one you installed
    messages: deepSeekFormMessages,
  });
  return response.message.content;
});
```

# Usage

## Clone the Repository

```bash
git clone https://github.com/bogdanishere/Desktop-App---ElectronJs
```

## Run the Application
```bash
npm start
```

## Build and Packaging
```bash
npm run make 
```





