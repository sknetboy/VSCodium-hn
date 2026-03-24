export class Logger {
  info(message: string, meta?: unknown): void {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log("WARN", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.log("ERROR", message, meta);
  }

  private log(level: string, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    if (meta !== undefined) {
      console.log(`[${timestamp}] [${level}] ${message}`, meta);
      return;
    }
    console.log(`[${timestamp}] [${level}] ${message}`);
  }
}

export const logger = new Logger();
