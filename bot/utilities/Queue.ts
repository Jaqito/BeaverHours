enum UserRole {
  Student = "STUDENT",
  Instructor = "INSTRUCTOR",
}

enum QueueStatus {
  Scheduled = "SCHEDULED",
  Active = "ACTIVE",
  Closed = "CLOSED",
  Cancelled = "CANCELLED",
}

interface QueueProperties {
  id?: number;
  ownerId?: string;
  channelId?: string;
  startTime?: Date;
  status?: QueueStatus;
}

interface QueueEntry {
  id: number;
  userId: string;
  queueId: number;
  question: string;
  resolved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface User {
  id: number;
  fullName: string;
  role: UserRole;
}

export class Queue {
  properties: QueueProperties;
  entries: Array<QueueEntry>;
  notificationTimer: NodeJS.Timer;
  entriesCopy: Array<QueueEntry>;

  constructor({
    id = -1,
    ownerId = "-1",
    channelId = "-1",
    startTime = new Date(Date.now()),
    status = QueueStatus.Active,
  }: QueueProperties) {
    this.properties = { id, ownerId, channelId, startTime, status };
    this.entries = [];
    this.entriesCopy = this.entries;
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

  updateState() {
    this.entriesCopy = this.entries;
  }

  sendNotifsToQueue() {
   if (this.entries != this.entriesCopy) {
      // for all memebers in queue, message them their position
      // use of proactive messages can possible achieve this: https://docs.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/send-proactive-messages?tabs=typescript
   } else {
       console.log("No queue changes, not sending notifications");
       this.setNotificationTimeout(60);
   } 
  }

  setNotificationTimeout(seconds: number) {
    this.notificationTimer = setInterval(this.sendNotifsToQueue, seconds);
  }

}
