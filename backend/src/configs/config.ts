import * as dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 9000,
    jwtSecret: process.env.JWT_SECRET,
    prefix: `${(process.env.MODE || 'SIT').toLowerCase()}${process.env.API_DIR}${process.env.API_VERSION}`,
    allowed: process.env.ALLOWED_CLIENTS,
    origin: process.env.ALLOWED_ORIGINS,
    mode_env: process.env.MODE,
    db_primary: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: process.env.DB_CHARSET || "utf8mb4",
        multipleStatements: false,
    },
    db_secondary: {
        host: process.env.BACKOFFICE_DB_HOST,
        user: process.env.BACKOFFICE_DB_USER,
        password: process.env.BACKOFFICE_DB_PASSWORD,
        database: process.env.BACKOFFICE_DB_NAME,
        charset: process.env.DB_CHARSET || "utf8mb4",
        multipleStatements: false,
    },
    db_kphis: {
        host: process.env.DB_KPHIS_HOST,
        user: process.env.DB_KPHIS_USER,
        password: process.env.DB_KPHIS_PASSWORD,
        database: process.env.DB_KPHIS_NAME,
        charset: "utf8mb4",
        multipleStatements: false,
    },
    verion: process.env.APP_VERSION,
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
    CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
    CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    MOPH_APT_URL: process.env.MOPH_APT_URL ?? "",
    MOPH_CLIENT_ID: process.env.MOPH_CLIENT_ID ?? "",
    MOPH_SECRET_ID: process.env.MOPH_SECRET_ID ?? "",

};

export default config;