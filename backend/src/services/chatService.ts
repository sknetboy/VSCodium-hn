import { ChatResult } from "../domain/types";
import { TritonClient } from "../triton/triton_client";
import { logger } from "../utils/logger";
import { ConversationService } from "./conversationService";
import { FallbackModel } from "./fallbackModel";

export class ChatService {
  constructor(
    private readonly tritonClient: TritonClient,
    private readonly conversationService: ConversationService,
    private readonly fallbackModel: FallbackModel
  ) {}

  async chat(userMessage: string): Promise<ChatResult> {
    const context = await this.conversationService.buildContext();
    const prompt = `Contexto:\n${context}\n\nUsuario: ${userMessage}\nAsistente:`;

    let reply: string;
    let usedFallback = false;

    try {
      const tritonUp = await this.tritonClient.isAvailable();
      if (!tritonUp) {
        throw new Error("Triton no está activo");
      }
      const output = await this.tritonClient.generate(prompt);
      reply = output.text;
    } catch (error) {
      usedFallback = true;
      logger.warn("Se usará fallback para /chat", error);
      reply = this.fallbackModel.generateChatReply(userMessage, context);
    }

    await this.conversationService.storeUserAndAssistant(userMessage, reply);

    return { reply, usedFallback };
  }
}
