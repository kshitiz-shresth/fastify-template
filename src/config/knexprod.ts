import { Knex } from "knex";
import dotenv from "dotenv";
import { knexSnakeCaseMappers } from "objection";

dotenv.config();

const knexConfig: Knex.Config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "backendbase",
    port: Number(process.env.DB_PORT) || 3306,
  },
  migrations: {
    directory: "../migrations",
  },
  seeds: {
    directory: "../seeds",
  },
  ...knexSnakeCaseMappers(),
};

export default knexConfig;
