export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  usedFallback: boolean;
}

export interface CompletionRequest {
  prefix: string;
  suffix?: string;
}

export interface CompletionResponse {
  completion: string;
  usedFallback: boolean;
}

export class BackendClient {
  constructor(private readonly baseUrl: string) {}

  async chat(message: string): Promise<ChatResponse> {
    return this.post<ChatResponse>("/chat", { message });
  }

  async completion(prefix: string, suffix?: string): Promise<CompletionResponse> {
    return this.post<CompletionResponse>("/completion", { prefix, suffix });
  }

  private async post<T>(path: string, payload: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend error ${response.status}: ${text}`);
    }

    return (await response.json()) as T;
  }
}
