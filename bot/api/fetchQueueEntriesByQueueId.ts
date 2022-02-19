import { Connection } from "typeorm";
import { QueueEntryEntity } from "../entities/queueEntry";

export default async (conn: Connection, queueId: number) => {
  try {
    const result = await conn
      .getRepository(QueueEntryEntity)
      .createQueryBuilder()
      .where(`"queueId" = :queueId`, {
        queueId,
      })
      .getMany();
    return result;
  } catch (e) {
    console.log(
      `Failed to fetch QueueEntries from Database with queueId: ${queueId}`,
      e
    );
    throw e;
  }
};
