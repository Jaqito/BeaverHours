import { Connection } from "typeorm";
import Queue from "../utilities/Queue";
import { Queue as QueueEntity } from "../entities/queue";

export default async (conn: Connection, queue: Queue) => {
  try {
    const result = await conn
      .createQueryBuilder()
      .insert()
      .into(QueueEntity)
      .values({
        ownerId: queue.properties.ownerId,
        channelId: queue.properties.channelId,
        startTime: queue.properties.startTime,
        status: queue.properties.status,
      })
      .execute();
  } catch (e) {
    console.log("Failed to add Queue to Database");
    throw e;
  }
};
