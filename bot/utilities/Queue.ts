import { QueueProperties, QueueEntry, QueueStatus } from "./Global";

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

  enqueueStudent(idToAdd: string): void {
    const studentToAdd: QueueEntry = {
      id: Math.random() * 1000,
      userId: idToAdd,
      queueId: this.properties.id,
      question: "",
      resolved: false,
      createdAt: new Date(Date.now()),
      // leaving updatedAt for post-creation updates only
    };
    this.entries.push(studentToAdd);
  }

  dequeueStudent(idToRemove: string): void {
    this.entries.splice(this.getQueuePosition(idToRemove), 1);
  }

  queueToString(): String {
    var queueString: String = "[";
    this.entries.forEach(function (student) {
      if (queueString.length != 1) {
        queueString += ",";
      }

      queueString += `{id: ${student.id},
          userId: ${student.userId},
          resolved: ${student.resolved}, 
          createdAt: ${student.createdAt},
          updatedAt: ${student.updatedAt ?? ""}}`;
    });
    queueString += "]";
    return queueString;
  }
}
