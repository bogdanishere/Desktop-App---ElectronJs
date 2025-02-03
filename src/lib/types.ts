export type MessageDeepseek = {
  role: "user" | "system" | "assistant";
  content: string;
};

export type FragmentType = "text" | "code" | "think";

export type Fragment = {
  type: FragmentType;
  /** În cazul 'code', conține (optionally) limbajul detectat după ```lang */
  language?: string;
  /** Conținutul propriu-zis */
  content: string;
};
