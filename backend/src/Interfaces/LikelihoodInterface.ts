export interface LikelihoodCriteria {
    id?: number;
    group_id: number;
    level_score: number;
    min_freq: number;
    max_freq: number | null;
    updated_by?: string;
    updated_at?: string;
}

export interface LikelihoodCriteriaUpdateBody {
    items: LikelihoodCriteria[];
    updated_by?: string;
}
