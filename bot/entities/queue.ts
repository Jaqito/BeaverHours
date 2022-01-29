import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { QueueEntry } from './queueEntry';

@Entity('queue') //table name is users
export class Queue extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    channelId: string;

    @Column()
    startTime: Date;

    @Column()
    ownerId: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @UpdateDateColumn()
    updatedAt: Date = new Date();

    @OneToMany(() => QueueEntry, (queueEntry) => queueEntry.queue)
    queueEntries: QueueEntry[];
}
