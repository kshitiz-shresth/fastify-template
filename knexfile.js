const dotenv = require("dotenv");
dotenv.config();

const knexConfig = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "backendbase",
    port: Number(process.env.DB_PORT) || 3306,
  },
  migrations: {
    directory: `./dist/migrations`,
  },
  seeds: {
    directory: `./dist/seeds`,
  },
};

module.exports = knexConfig;
