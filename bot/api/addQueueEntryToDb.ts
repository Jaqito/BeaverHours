import { Connection } from "typeorm";
import { QueueEntryEntity } from "../entities/queueEntry";

export default async (
  conn: Connection,
  userId: string,
  queueId: any,
  question?: string
) => {
  console.log(userId, queueId);
  try {
    const result = await conn
      .createQueryBuilder()
      .insert()
      .into(QueueEntryEntity)
      .values({
        resolved: false,
        queue: queueId,
        userId: userId,
        question: question ? question : null, //if no question insert null into db.
      })
      .execute();
    return result.raw[0];
  } catch (e) {
    console.log("Failed to add Queue to Database", e);
    throw e;
  }
};
