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
    version: process.env.APP_VERSION,
    MOPH_APT_URL: process.env.MOPH_APT_URL ?? "",
    MOPH_CLIENT_ID: process.env.MOPH_CLIENT_ID ?? "",
    MOPH_SECRET_ID: process.env.MOPH_SECRET_ID ?? "",

    // Cookie auth settings — intranet HTTP ใช้ secure=false, online HTTPS ใช้ true
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    cookieSameSite: (process.env.COOKIE_SAMESITE || 'lax') as 'lax' | 'strict' | 'none',
    cookieMaxAgeSec: Number(process.env.COOKIE_MAX_AGE_SEC || 86400),
    cookieName: process.env.COOKIE_NAME || 'access_token',
};

export default config;