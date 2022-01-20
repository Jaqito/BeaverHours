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

  checkQueue(idToCheck: string): boolean {
    if (
      this.entries.find((student) => student.userId == idToCheck) != undefined
    ) {
      return true;
    }
    return false;
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
