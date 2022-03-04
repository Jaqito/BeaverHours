import { Connection } from "typeorm";
import { QueueEntryEntity } from "../entities/queueEntry";
import { StudentStatus } from "../utilities/Global";

export default async (conn: Connection, id: number, status: StudentStatus) => {
  try {
    const result = await conn
      .createQueryBuilder()
      .update(QueueEntryEntity)
      .set({ resolved: status })
      .where("id = :id", { id })
      .execute();
    return result;
  } catch (e) {
    console.log(`Failed to update student's resolved state ${id}:`, e);
    throw e;
  }
};
