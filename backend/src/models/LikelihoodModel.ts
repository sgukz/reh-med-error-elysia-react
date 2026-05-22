import { Knex } from "knex";
import { LikelihoodCriteria, LikelihoodCriteriaUpdateBody } from "../Interfaces/LikelihoodInterface";

export default class LikelihoodModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    async getLikelihoodCriteria() {
        return await this.db('med_error_likelihood_criteria')
            .orderBy('error_type', 'asc')
            .orderBy('level_score', 'desc');
    }

    async updateLikelihoodCriteria(body: LikelihoodCriteriaUpdateBody) {
        const { items, updated_by } = body;
        
        // Use a transaction since we are updating multiple rows
        return await this.db.transaction(async (trx) => {
            let updatedCount = 0;
            for (const item of items) {
                // If ID is provided, update existing
                if (item.id) {
                    await trx('med_error_likelihood_criteria')
                        .where('id', item.id)
                        .update({
                            min_freq: item.min_freq,
                            max_freq: item.max_freq !== undefined ? item.max_freq : null,
                            updated_by: updated_by || null,
                        });
                    updatedCount++;
                }
            }
            return updatedCount;
        });
    }
}
