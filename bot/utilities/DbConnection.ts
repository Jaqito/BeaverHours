import { ConnectionPool, connect as mssqlConnect, Response } from "mssql";
import { Storage, ConnectionStatus } from "./Global";

export default class DbConnection implements Storage {
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

  async select(table: string, filter?: any): Response {
    try {
      if (filter !== undefined) {
        const filterString = DbConnection.objToString(filter);
        const result = await this.pool.query(
          `SELECT * FROM ${table} WHERE ${filterString};`
        );
        return result;
      } else {
        const result = await this.pool.query(`SELECT * FROM ${table};`);
        return result;
      }
    } catch (err) {
      console.error(`DbConnection.select error: ${err}.`);
    }
  }

  async insert(table: string, value: any) {
    try {
      const keys = Object.keys(value);
      const values = Object.values(value);
      const result = await this.pool.query(
        `INSERT INTO ${table} (${keys.join(",")})
        VALUES (${values.map((v) => `'${v}'`).join(",")});`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.insert error: ${err}.`);
    }
  }

  async update(table: string, oldValue: any, newValue: any) {
    try {
      const oldValueString = DbConnection.objToString(oldValue);
      const newValueString = DbConnection.objToString(newValue);
      const result = await this.pool.query(
        `UPDATE ${table} SET ${oldValueString} WHERE ${newValueString};`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.update error: ${err}.`);
    }
  }

  async delete(table: string, value: any) {
    try {
      const valueString = DbConnection.objToString(value);
      const result = await this.pool.query(
        `DELETE FROM ${table} WHERE ${valueString};`
      );
      return result;
    } catch (err) {
      console.error(`DbConnection.delete error: ${err}.`);
    }
  }

  private static objToString(obj: any) {
    try {
      const entries = Object.entries(obj);
      return entries.map(([k, v]) => `${k}='${v}'`).join(", ");
    } catch (err) {
      return "";
    }
  }
}
