import { Knex } from "knex";
import config from "./config";

export const dbPrimary: Knex.Config = {
    client: "mysql2", // ใช้ MySQL2 สำหรับ MariaDB
    connection: config.db_primary
};

export const dbSecondary: Knex.Config = {
    client: "mysql2", // ใช้ MySQL2 สำหรับ MariaDB
    connection: config.db_secondary
};

export const dbKphis: Knex.Config = {
    client: "mysql2", // ใช้ MySQL2 สำหรับ MariaDB
    connection: config.db_kphis
};



