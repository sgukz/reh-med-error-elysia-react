import { t } from 'elysia'

export const MentalFormCreateSchema = t.Object({
    an: t.String({ minLength: 9, maxLength: 9 }),
    patient_name: t.String({ minLength: 10, maxLength: 100 }),
    create_date: t.String({ minLength: 10, maxLength: 10 }),
    generalAppearance: t.String(),
    speech: t.String(),
    moodAffect: t.String(),
    thought: t.String(),
    perception: t.String(),
    delusion: t.String(),
    orientation: t.String(),
    memory: t.String(),
    concentration: t.String(),
    intelligence: t.String(),
    abstractReasoning: t.String(),
    judgment: t.String(),
    insight: t.String(),
})

export type MentalFormCreate = typeof MentalFormCreateSchema['static']