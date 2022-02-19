import { Connection } from "typeorm";
import { QueueEntity } from "../entities/queue";

export default async (conn: Connection, ownerId: string, channelId: string) => {
  try {
    const result = await conn
      .getRepository(QueueEntity)
      .createQueryBuilder()
      .where(`"ownerId" = :ownerId AND "channelId" = :channelId`, {
        ownerId,
        channelId,
      })
      .getMany();
    return result;
  } catch (e) {
    console.log(
      `Failed to fetch Queues from Database with ownerId: ${ownerId} and channelId: ${channelId}`,
      e
    );
    throw e;
  }
};
