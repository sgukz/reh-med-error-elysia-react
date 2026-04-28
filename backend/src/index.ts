import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { cors } from "@elysiajs/cors";

// Config
import config from "./configs/config";
// Route
import AuthRoute from "./routes/AuthRoute";
import MedErrorRoute from "./routes/MedErrorRoute";
// Plugin
import { DBMain, DBSec } from './plugins/db'
// Helper
import { checkDb } from "./helpers/CheckConnection";

const ALLOWED_ORIGIN_LIST = (config.origin || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = new Elysia()
  .use(cors({
    origin: ALLOWED_ORIGIN_LIST.length ? ALLOWED_ORIGIN_LIST : false, // อนุญาตเฉพาะ origin ที่กำหนดใน .env
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }))
  .use(AuthRoute)
  .use(MedErrorRoute)
  .get('/alive', () => ({
    statusCode: StatusCodes.OK,
    status: 'alive',
    apiName: 'Med Error API',
    version: config.version,
    buildDate: new Date().toLocaleDateString(),
    message: 'Welcome to Med Error API',
  }));

// เริ่มเซิร์ฟเวอร์
app.listen(config.port, async () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );

  const db_hos = await checkDb(DBMain)
  if (!db_hos.ok) {
    console.error(`❌ [${db_hos.dbName ?? "-"}] not ready: ${db_hos.error}`);
  } else {
    console.log(`✅ [${db_hos.dbName ?? "-"}] ready in ${db_hos.latencyMs}ms`);
  }

  const db_med_error = await checkDb(DBSec)
  if (!db_med_error.ok) {
    console.error(`❌ [${db_med_error.dbName ?? "-"}] not ready: ${db_med_error.error}`);
  } else {
    console.log(`✅ [${db_med_error.dbName ?? "-"}] ready in ${db_med_error.latencyMs}ms`);
  }
});
