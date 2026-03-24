import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  port: number;
  databaseUrl: string;
  tritonUrl: string;
  modelName: string;
}

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT ?? 4000);
  const databaseUrl = process.env.DATABASE_URL;
  const tritonUrl = process.env.TRITON_URL ?? "http://127.0.0.1:8000";
  const modelName = process.env.MODEL_NAME ?? "codegen";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido en .env");
  }

  return {
    port,
    databaseUrl,
    tritonUrl,
    modelName
  };
}
