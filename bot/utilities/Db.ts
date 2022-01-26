import { ConnectionPool, connect as mssqlConnect } from "mssql";

enum ConnectionStatus {
  Awaiting = "AWAITING",
  Connected = "CONNECTED",
  Error = "ERROR",
}

export default class DbConnection {
  pool: ConnectionPool;
  connectionStatus: ConnectionStatus = ConnectionStatus.Awaiting;

  async connect(config) {
    try {
      this.pool = await mssqlConnect(config);
      this.connectionStatus = ConnectionStatus.Connected;
      console.log("Database connected successfully");
    } catch (err) {
      this.connectionStatus = ConnectionStatus.Error;
      console.error(`Error establishing database connection: ${err}.`);
    }
  }

  async select() {
    try {
      const result = await this.pool.query(`select * from testTable;`);
      return result;
    } catch (err) {
      console.error(`DbConnection.select error: ${err}.`);
    }
  }

  async insert(name) {
    try {
      const result = await this.pool.query(
        `INSERT INTO testTable (name) VALUES ('${name}');`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.insert error: ${err}.`);
    }
  }

  async update(id, name) {
    try {
      const result = await this.pool.query(
        `UPDATE testTable SET name='${name}' WHERE id=${id};`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.update error: ${err}.`);
    }
  }

  async delete(name) {
    try {
      const result = await this.pool.query(
        `DELETE FROM testTable WHERE name='${name}';`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.delete error: ${err}.`);
    }
  }
}
