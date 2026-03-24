import { Request, Response } from "express";
import { CompletionService } from "../services/completionService";

export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  postCompletion = async (req: Request, res: Response): Promise<void> => {
    const { prefix, suffix } = req.body as { prefix?: string; suffix?: string };

    if (!prefix || !prefix.trim()) {
      res.status(400).json({ error: "prefix es requerido" });
      return;
    }

    const result = await this.completionService.complete(prefix, suffix);
    res.json(result);
  };
}
