import { QueueEntryEntity } from "../entities/queueEntry";

export default class QueueEntry {
  id: number;
  userId: string;
  queueId: number;
  question: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor({ id, userId, queueId, question, resolved }) {
    this.id = id;
    this.userId = userId;
    this.queueId = queueId;
    this.question = question;
    this.resolved = resolved;
  }

  setQueueId(queueId: number): void {
    this.queueId = queueId;
  }

  static fromQueueEntryEntity(queueEntryEntity: QueueEntryEntity): QueueEntry {
    const entry = new QueueEntry({
      id: queueEntryEntity.id,
      userId: queueEntryEntity.userId,
      queueId: null,
      question: queueEntryEntity.question,
      resolved: queueEntryEntity.resolved,
    });
    entry.createdAt = queueEntryEntity.createdAt;
    entry.updatedAt = queueEntryEntity.updatedAt;
    return entry;
  }

  toString(): string {
    return (
      `\n\n           id: ${this.id},\n` +
      `      queueId: ${this.queueId},\n` +
      `       userId: ${this.userId},\n` +
      `     question: ${this.question},\n` +
      `     resolved: ${this.resolved},\n` +
      `    createdAt: ${this.createdAt ?? ""},\n` +
      `    updatedAt: ${this.updatedAt ?? ""}\n`
    );
  }
}
