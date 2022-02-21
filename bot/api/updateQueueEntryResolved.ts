import { Connection } from "typeorm";
import { QueueEntryEntity } from "../entities/queueEntry";
import { StudentStatus } from "../utilities/Global";

export default async (conn: Connection, id: number) => {
    try{
        const result = await conn
            .createQueryBuilder()
            .update(QueueEntryEntity)
            .set({ resolved: StudentStatus.Resolved, })
            .where("id = :id", { id })
            .execute();
        return result;
    } catch (e) {
        console.log(`Failed to update Resolved state of student ${id}:`, e);
        throw e;
    }
}