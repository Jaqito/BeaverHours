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
  properties: QueueProperties;
  entries: Array<QueueEntry>;
  createdAt?: Date;
  updatedAt?: Date;

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
}
