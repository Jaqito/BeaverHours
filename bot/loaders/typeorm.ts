import { Queue } from '../entities/queue';
import { QueueEntry } from '../entities/queueEntry';
import { Connection, createConnection } from 'typeorm';
import path from 'path';

export default async (): Promise<Connection> => {
    const conn = await createConnection({
        type: 'mssql',
        host: process.env.SQL_ENDPOINT,
        database: process.env.SQL_DATABASE_NAME,
        username: process.env.SQL_USERNAME,
        password: process.env.SQL_PASSWORD,
        logging: false,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Queue, QueueEntry],
    });
    await conn.runMigrations();
    return conn;
};
