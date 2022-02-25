import QueueEntry from "./QueueEntry";
import { QueueProperties, QueueStatus, StudentStatus } from "./Global";
import { QueueEntity } from "../entities/queue";
import { QueueEntryEntity } from "../entities/queueEntry";
import { ThisMemoryScope } from "botbuilder-dialogs";

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

  updateStatus(queueStatus: QueueStatus) {
    this.properties.status = queueStatus;
  }

  get length(): number {
    return this.entries.length;
  }

  isEmpty(): boolean {
    return this.length == 0;
  }

  isNotEmpty(): boolean {
    return this.length != 0;
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
      resolved: StudentStatus.Waiting,
    });
    this.entries.push(studentToAdd);
  }

  dequeueStudent(idToRemove: string): void {
    this.entries.splice(this.getQueuePosition(idToRemove), 1);
  }

  findFirstConversing(): QueueEntry {
    return this.entries.find(
      (student) => student.resolved == StudentStatus.Conversing
    );
  }

  findFirstWaiting(): QueueEntry {
    return this.entries.find(
      (student) => student.resolved == StudentStatus.Waiting
    );
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

  getNamesInQueue(teamMembers: any) {
    if (this.entries.length == 0) {
      return `No queue entries in queue ${this.properties.id}`;
    }

    const entries = this.entries.map((entry, index) => {
      const member = teamMembers.find((t) => t.id === entry.userId);
      if (entry.question && !entry.privateEntry) {
        return `${index + 1}) ${member.name}, Question: ${entry.question}\n`;
      } else {
        return `${index + 1}) ${member.name}\n`;
      }
    });
    let message = "\n\n";
    entries.forEach((e) => {
      message += e;
    });

    return message;
  }

  entriesToString(showPrivate: boolean = false): string {
    if (this.entries.length == 0) {
      return `No queue entries in queue ${this.properties.id}`;
    }

    const entryStrings = this.entries.map((entry) =>
      entry.toString(showPrivate)
    );
    return "[" + entryStrings.join(",") + "]";
  }
}
