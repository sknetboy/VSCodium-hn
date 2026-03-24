import { CompletionResult } from "../domain/types";
import { TritonClient } from "../triton/triton_client";
import { logger } from "../utils/logger";
import { FallbackModel } from "./fallbackModel";

export class CompletionService {
  constructor(
    private readonly tritonClient: TritonClient,
    private readonly fallbackModel: FallbackModel
  ) {}

  async complete(prefix: string, suffix = ""): Promise<CompletionResult> {
    const prompt = `Completa el siguiente código de forma concisa.\n\n${prefix}\n${suffix}`;

    try {
      const tritonUp = await this.tritonClient.isAvailable();
      if (!tritonUp) {
        throw new Error("Triton no está activo");
      }
      const output = await this.tritonClient.generate(prompt);
      return { completion: output.text, usedFallback: false };
    } catch (error) {
      logger.warn("Se usará fallback para /completion", error);
      const fallback = this.fallbackModel.generateCompletion(prefix);
      return { completion: fallback, usedFallback: true };
    }
  }
}
