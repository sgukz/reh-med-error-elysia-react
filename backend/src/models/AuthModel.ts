import { Knex } from "knex";

export default class AuthModel {
    async getAuth(db: Knex, secret_key: string, client_uuid: string, mode: string) {
        return db("db_authorization_service.client_list")
            .select()
            .where("is_activate", 'Y')
            .andWhere({
                "client_id": client_uuid,
                "mode": mode,
                "secret_key": secret_key
            })
    }
}
