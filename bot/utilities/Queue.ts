import QueueEntry from "./QueueEntry";
import { QueueProperties, QueueStatus } from "./Global";
import { QueueEntity } from "../entities/queue";
import { QueueEntryEntity } from "../entities/queueEntry";

interface enqueueOptions {
  privateEntry?: boolean;
  question?: string;
}

export default class Queue {
  properties: QueueProperties;
  entries: Array<QueueEntry>;

  constructor({
    id = -1,
    ownerId = "-1",
    channelId = "-1",
    startTime = new Date(Date.now()),
    status = QueueStatus.Active,
  }: QueueProperties) {
    this.properties = { id, ownerId, channelId, startTime, status };
    this.entries = [];
  }

  static fromQueueEntity(queueEntity: QueueEntity): Queue {
    return new Queue({
      id: queueEntity.id,
      ownerId: queueEntity.ownerId,
      channelId: queueEntity.channelId,
      startTime: new Date(queueEntity.startTime),
      status: queueEntity.status as QueueStatus,
    });
  }

  updateId(queueId: number) {
    this.properties.id = queueId;
  }

  get length(): number {
    return this.entries.length;
  }

  findStudent(idToFind: string): QueueEntry {
    return this.entries.find((student) => student.userId == idToFind);
  }

  checkQueue(idToCheck: string): boolean {
    if (this.findStudent(idToCheck) != undefined) {
      return true;
    }
    return false;
  }

  getQueuePosition(idToGet: string): number {
    return this.entries.indexOf(this.findStudent(idToGet));
  }

  enqueueQueueEntryEntity(queueEntryEntity: QueueEntryEntity) {
    const newEntry = QueueEntry.fromQueueEntryEntity(queueEntryEntity);
    this.entries.push(newEntry);
  }

  enqueueStudentById(idToAdd: string, options?: enqueueOptions): void {
    const studentToAdd = new QueueEntry({
      id: null,
      userId: idToAdd,
      queueId: this.properties.id,
      privateEntry: options.privateEntry ?? false,
      question: options.question ?? "",
      resolved: false,
    });
    this.entries.push(studentToAdd);
  }

  dequeueStudent(idToRemove: string): void {
    this.entries.splice(this.getQueuePosition(idToRemove), 1);
  }

  propertiesToString(): string {
    return (
      `\n\n           id: ${this.properties.id}\n` +
      `      ownerId: ${this.properties.ownerId}\n` +
      `    channelId: ${this.properties.channelId}\n` +
      `       status: ${this.properties.status}\n` +
      `           at: ${this.properties.startTime}`
    );
  }

  entriesToString(): string {
    if (this.entries.length == 0) {
      return `No queue entries in queue ${this.properties.id}`;
    }
    const entryStrings = this.entries.map((entry) => entry.toString());
    return "[" + entryStrings.join(",") + "]";
  }
}
