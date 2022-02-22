import { Connection } from "typeorm";
import Queue from "../utilities/Queue";
import { QueueEntity } from "../entities/queue";

export default async (conn: Connection, queue: Queue) => {
  try {
    await conn
      .createQueryBuilder()
      .update(QueueEntity)
      .set({ status: queue.properties.status })
      .where("id = :id", { id: queue.properties.id })
      .execute();
  } catch (e) {
    console.log("Failed to update Queue in Database", e);
    throw e;
  }
};
