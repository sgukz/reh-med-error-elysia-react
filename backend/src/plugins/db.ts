import Knex from "knex";
import { dbPrimary, dbSecondary, dbKphis } from "../configs/knexfile";

export const DBMain = Knex(dbPrimary);
export const DBSec = Knex(dbSecondary);
export const DBKphis = Knex(dbKphis);
