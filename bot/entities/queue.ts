import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QueueEntryEntity } from "./queueEntry";

@Entity("queue") //table name is users
export class QueueEntity extends BaseEntity {
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

  @OneToMany(
    () => QueueEntryEntity,
    (queueEntryEntity) => queueEntryEntity.queue
  )
  queueEntries: QueueEntryEntity[];
}
