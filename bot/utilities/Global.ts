export interface Storage {
  connect?(config): void;
  select(destination: string, filter?);
  insert(destination: string, value);
  update(destination: string, oldValue, newValue);
  delete(destination: string, filter);
}

export enum UserRole {
  Student = "STUDENT",
  Instructor = "INSTRUCTOR",
}

export enum QueueStatus {
  Scheduled = "SCHEDULED",
  Active = "ACTIVE",
  Closed = "CLOSED",
  Cancelled = "CANCELLED",
}

export enum ConnectionStatus {
  Awaiting = "AWAITING",
  Connected = "CONNECTED",
  Error = "ERROR",
}

export interface QueueProperties {
  id?: number;
  ownerId?: string;
  channelId?: string;
  startTime?: Date;
  status?: QueueStatus;
}

export interface QueueEntry {
  id: number;
  userId: string;
  queueId: number;
  question: string;
  resolved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
