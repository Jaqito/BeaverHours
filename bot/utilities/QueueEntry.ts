import { QueueEntryEntity } from "../entities/queueEntry";

export default class QueueEntry {
  id: number;
  userId: string;
  queueId: number;
  privateEntry: boolean;
  question: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor({ id, userId, queueId, privateEntry, question, resolved }) {
    this.id = id;
    this.userId = userId;
    this.queueId = queueId;
    this.privateEntry = privateEntry;
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
      queueId: queueEntryEntity.queue,
      privateEntry: queueEntryEntity.privateEntry,
      question: queueEntryEntity.question,
      resolved: queueEntryEntity.resolved,
    });
    entry.createdAt = queueEntryEntity.createdAt;
    entry.updatedAt = queueEntryEntity.updatedAt;
    return entry;
  }

  toString(showPrivate: boolean = false): string {
    // prettier-ignore
    return (
      `\n\n           id: ${this.id},\n` +
      `      queueId: ${this.queueId},\n` +
      `       userId: ${this.userId},\n` +
      `     question: ${!this.privateEntry || showPrivate ? this.question : "private"},\n` +
      `      private: ${this.privateEntry},\n` +
      `     resolved: ${this.resolved},\n` +
      `    createdAt: ${this.createdAt ?? ""},\n` +
      `    updatedAt: ${this.updatedAt ?? ""}\n`
    );
  }
}
