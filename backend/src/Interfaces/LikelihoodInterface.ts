export interface LikelihoodCriteria {
    id?: number;
    error_type: number; // 1-6 ตามประเภท Error (เดิมใช้ group_id 1-3)
    group_id?: number;  // คงไว้เพื่อ backward-compat / rollback
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
