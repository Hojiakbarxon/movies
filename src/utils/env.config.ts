import { config } from "dotenv";
config();

export let envConfig = {
    port: Number(process.env.PORT),
    mail: {
        host: String(process.env.MAIL_HOST),
        user: String(process.env.MAIL_USER),
        password: String(process.env.MAIL_PASS),
        port: Number(process.env.MAIL_PORT)
    },
    token: {
        access: {
            time: String(process.env.ACCESS_TOKEN_TIME),
            key: String(process.env.ACCESS_TOKEN_KEY)
        },
        refresh: {
            time: String(process.env.REFRESH_TOKEN_TIME),
            key: String(process.env.REFRESH_TOKEN_KEY)
        }
    },
    superadmin: {
        email: String(process.env.SUPER_ADMIN_EMAIL),
        username: String(process.env.SUPER_ADMIN_USERNAME),
        password: String(process.env.SUPER_ADMIN_PASSWORD)
    }
};
