import * as pg from "pg";

import dotenv from "dotenv";

dotenv.config();

const DBUser = process.env.DB_USER;
const DBHost = process.env.DB_HOST;
const DBName = process.env.DB_NAME;
const DBPassword = process.env.DB_PASSWORD;
const DBPort = process.env.DB_PORT;

const pool = new pg.Pool({
  user: DBUser,
  host: DBHost,
  database: DBName,
  password: DBPassword,
  port: DBPort ? +DBPort : 5432,
});

const getConnection = (): Promise<pg.PoolClient> => {
  return new Promise((resolve, reject) => {
    pool.connect((error, connection) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(connection as pg.PoolClient);
    });
  });
};

export default getConnection;
