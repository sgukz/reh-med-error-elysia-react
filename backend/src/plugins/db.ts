import Knex from "knex";
import { dbPrimary, dbSecondary } from "../configs/knexfile";

export const DBMain = Knex(dbPrimary);
export const DBSec = Knex(dbSecondary);
