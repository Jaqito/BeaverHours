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

interface QueueEntry {
  id: number;
  userId: number;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class Queue {
  id: number;
  ownerId: number;
  channelId: number;
  startTime: Date;
  status: QueueStatus;
  entries: Array<QueueEntry>;
  createdAt?: Date;
  updatedAt?: Date;

  constructor() {
    this.id = Math.floor(Math.random() * 100000);
    this.ownerId = Math.floor(Math.random() * 100000);
    this.channelId = Math.floor(Math.random() * 100000);
    this.startTime = new Date(Date.now());
    this.status = QueueStatus.Active;
    this.entries = [];
  }
}
