import { v4 as uuidv4 } from 'uuid';

enum UserRole {
    Student = 'STUDENT',
    Instructor = 'INSTRUCTOR',
}

export enum QueueStatus {
    Scheduled = 'SCHEDULED',
    Active = 'ACTIVE',
    Closed = 'CLOSED',
    Cancelled = 'CANCELLED',
}

interface QueueProperties {
    id?: string;
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
}

export class Queue {
    properties: QueueProperties;
    entries: Array<QueueEntry>;

    constructor({
        id = uuidv4(),
        ownerId = '-1',
        channelId = '-1',
        startTime = new Date(Date.now()),
        status = QueueStatus.Active,
    }: QueueProperties) {
        this.properties = { id, ownerId, channelId, startTime, status };
        this.entries = [];
    }
}
