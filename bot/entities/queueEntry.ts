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
import { StudentStatus } from "../utilities/Global";
import { QueueEntity } from "./queue";

@Entity("queueEntry")
export class QueueEntryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId: string;

  @Column("bit", { default: false })
  privateEntry: boolean = false;

  @Column({ nullable: true })
  question: string | null;

  @Column()
  resolved: StudentStatus;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @ManyToOne(() => QueueEntity, (queue) => queue.queueEntries)
  @JoinColumn({ name: "queueId" })
  queue: QueueEntity;
}
