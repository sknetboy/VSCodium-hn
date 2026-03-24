export type MessageRole = "user" | "assistant";

export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatResult {
  reply: string;
  usedFallback: boolean;
}

export interface CompletionResult {
  completion: string;
  usedFallback: boolean;
}
