import {
  BaseEntity,
  Column,
  ColumnTypeUndefinedError,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";
import { Queue } from "./queue";

@Entity("queueEntry")
export class QueueEntry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId: string;

  @Column()
  question?: string;

  @Column()
  resolved: boolean;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @ManyToOne(() => Queue, (queue) => queue.queueEntries)
  @JoinColumn({ name: "queueId" })
  queue: Queue;
}
