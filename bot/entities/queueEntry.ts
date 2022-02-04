import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QueueEntity } from "./queue";

@Entity("queueEntry")
export class QueueEntryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId: string;

  @Column({ nullable: true })
  question: string | null;

  @Column()
  resolved: boolean;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @ManyToOne(() => QueueEntity, (queue) => queue.queueEntries)
  @JoinColumn({ name: "queueId" })
  queue: QueueEntity;
}
