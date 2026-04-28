import { Knex } from "knex";
import config from "./config";

const POOL = { min: 2, max: 20 };
const ACQUIRE_TIMEOUT = 30000;

export const dbPrimary: Knex.Config = {
    client: "mysql2", // ใช้ MySQL2 สำหรับ MariaDB
    connection: config.db_primary,
    pool: POOL,
    acquireConnectionTimeout: ACQUIRE_TIMEOUT,
};

export const dbSecondary: Knex.Config = {
    client: "mysql2", // ใช้ MySQL2 สำหรับ MariaDB
    connection: config.db_secondary,
    pool: POOL,
    acquireConnectionTimeout: ACQUIRE_TIMEOUT,
};
