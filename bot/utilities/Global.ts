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

export enum StudentStatus {
  Waiting = "WAITING",
  Conversing = "CONVERSING",
  Resolved = "RESOLVED",
}
