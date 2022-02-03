import { Connection } from "typeorm";
import Queue from "../utilities/Queue";
import { Queue as QueueEntity } from "../entities/queue";
import { QueueStatus } from "../utilities/Global";

export default async (
  conn: Connection,
  queueStatus: QueueStatus,
  channelId: string
) => {
  try {
    const result = await conn
      .getRepository(QueueEntity)
      .createQueryBuilder()
      .where(`status = :status AND "channelId" = :channelId`, {
        status: queueStatus,
        channelId: channelId,
      })
      .getMany();
    return result;
  } catch (e) {
    console.log(
      `Failed to fetch Queues to Database with status ${queueStatus} and channelId: ${channelId}`,
      e
    );
    throw e;
  }
};
