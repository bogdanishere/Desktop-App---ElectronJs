// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import type { ChatPair, MessageDeepSeek } from "./react/utils/types";

contextBridge.exposeInMainWorld("electronAPI", {
  chatDeepSeek: (
    mappingPageMessages: ChatPair[],
    deepSeekFormMessages: MessageDeepSeek[]
  ) =>
    ipcRenderer.invoke("chat-deepseek", {
      mappingPageMessages,
      deepSeekFormMessages,
    }),
});
