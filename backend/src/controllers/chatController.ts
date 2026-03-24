import { Request, Response } from "express";
import { ChatService } from "../services/chatService";

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  postChat = async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body as { message?: string };

    if (!message || !message.trim()) {
      res.status(400).json({ error: "message es requerido" });
      return;
    }

    const result = await this.chatService.chat(message.trim());
    res.json(result);
  };
}
