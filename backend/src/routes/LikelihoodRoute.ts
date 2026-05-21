import { Elysia, t } from "elysia";
import { DBSec } from "../plugins/db";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import LikelihoodModel from "../models/LikelihoodModel";

export const LikelihoodRoute = new Elysia({ prefix: "/api/likelihood" }).use(DBSec)
    .get(
        "/",
        async ({ DBSec }) => {
            try {
                const model = new LikelihoodModel(DBSec);
                const data = await model.getLikelihoodCriteria();

                if (data.length > 0) {
                    return { statusCode: StatusCodes.OK, dataList: data };
                } else {
                    return { statusCode: StatusCodes.NOT_FOUND, dataList: [] };
                }
            } catch (error) {
                console.error("[LikelihoodRoute] Error getLikelihoodCriteria:", error);
                return {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                };
            }
        },
        {
            detail: {
                summary: "Get Likelihood Criteria",
                tags: ["Likelihood"],
            },
        }
    )
    .put(
        "/",
        async ({ DBSec, body }) => {
            try {
                const model = new LikelihoodModel(DBSec);
                // Body is validated by Elysia `t.Object` below
                const updatedCount = await model.updateLikelihoodCriteria(body);

                return { 
                    statusCode: StatusCodes.OK, 
                    message: "อัปเดตเกณฑ์ Likelihood สำเร็จ",
                    updatedCount
                };
            } catch (error) {
                console.error("[LikelihoodRoute] Error updateLikelihoodCriteria:", error);
                return {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                };
            }
        },
        {
            body: t.Object({
                updated_by: t.Optional(t.String()),
                items: t.Array(
                    t.Object({
                        id: t.Number(),
                        group_id: t.Number(),
                        level_score: t.Number(),
                        min_freq: t.Number(),
                        max_freq: t.Union([t.Number(), t.Null()]),
                    })
                )
            }),
            detail: {
                summary: "Update Likelihood Criteria (Bulk)",
                tags: ["Likelihood"],
            },
        }
    );
