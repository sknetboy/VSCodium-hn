import { MessageRepository } from "../db/messageRepository";

export class ConversationService {
  constructor(private readonly repository: MessageRepository) {}

  async buildContext(maxMessages = 20): Promise<string> {
    const messages = await this.repository.getRecentMessages(maxMessages);
    return messages
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");
  }

  async storeUserAndAssistant(userMessage: string, assistantMessage: string): Promise<void> {
    await this.repository.saveMessage("user", userMessage);
    await this.repository.saveMessage("assistant", assistantMessage);
  }
}
