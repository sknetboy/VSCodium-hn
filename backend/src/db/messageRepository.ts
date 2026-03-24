import { Pool } from "pg";
import { Message, MessageRole } from "../domain/types";

export class MessageRepository {
  constructor(private readonly pool: Pool) {}

  async saveMessage(role: MessageRole, content: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO messages (role, content, timestamp)
       VALUES ($1, $2, NOW())`,
      [role, content]
    );
  }

  async getRecentMessages(limit = 20): Promise<Message[]> {
    const result = await this.pool.query<Message>(
      `SELECT id, role, content, timestamp::text AS timestamp
       FROM messages
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.reverse();
  }
}
