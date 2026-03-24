import express, { NextFunction, Request, Response } from "express";
import { loadConfig } from "./config";
import { ChatController } from "./controllers/chatController";
import { CompletionController } from "./controllers/completionController";
import { runMigrations } from "./db/migrations";
import { MessageRepository } from "./db/messageRepository";
import { createPool } from "./db/postgres";
import { CompletionService } from "./services/completionService";
import { ConversationService } from "./services/conversationService";
import { FallbackModel } from "./services/fallbackModel";
import { ChatService } from "./services/chatService";
import { TritonClient } from "./triton/triton_client";
import { logger } from "./utils/logger";

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  await runMigrations(pool);

  const repository = new MessageRepository(pool);
  const conversationService = new ConversationService(repository);
  const fallbackModel = new FallbackModel();
  const tritonClient = new TritonClient(config.tritonUrl, config.modelName);

  const chatService = new ChatService(tritonClient, conversationService, fallbackModel);
  const completionService = new CompletionService(tritonClient, fallbackModel);

  const chatController = new ChatController(chatService);
  const completionController = new CompletionController(completionService);

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/chat", wrap(chatController.postChat));
  app.post("/completion", wrap(completionController.postCompletion));

  app.post("/model", (req, res) => {
    const model = String(req.body?.model ?? "").trim();
    if (!model) {
      res.status(400).json({ error: "model es requerido" });
      return;
    }
    tritonClient.setModel(model);
    res.json({ ok: true, model });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Error no controlado", err);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  app.listen(config.port, () => {
    logger.info(`Backend iniciado en http://127.0.0.1:${config.port}`);
  });
}

function wrap(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

bootstrap().catch((error) => {
  logger.error("Error al iniciar backend", error);
  process.exit(1);
});
