import { logger } from "../utils/logger";

interface TritonInferenceOutput {
  text: string;
}

export class TritonClient {
  constructor(
    private tritonUrl: string,
    private modelName: string
  ) {}

  setModel(modelName: string): void {
    this.modelName = modelName;
    logger.info(`Modelo Triton actualizado a ${modelName}`);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.tritonUrl}/v2/health/live`);
      return response.ok;
    } catch (error) {
      logger.warn("Triton no disponible", error);
      return false;
    }
  }

  async generate(prompt: string): Promise<TritonInferenceOutput> {
    const inferUrl = `${this.tritonUrl}/v2/models/${this.modelName}/infer`;
    const payload = {
      inputs: [
        {
          name: "text_input",
          datatype: "BYTES",
          shape: [1],
          data: [prompt]
        }
      ]
    };

    const response = await fetch(inferUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Triton infer falló (${response.status})`);
    }

    const data = (await response.json()) as {
      outputs?: Array<{ data?: string[] }>;
    };

    const text = data.outputs?.[0]?.data?.[0];
    if (!text) {
      throw new Error("Respuesta de Triton sin texto");
    }

    return { text };
  }
}
