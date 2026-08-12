import * as winston from 'winston';

const { combine, colorize, printf, errors, timestamp } = winston.format;



const logFormat = printf(({ level, context, timestamp, message, stack }) => {
    return `${timestamp}: [${context || 'App'}] ${level}: ${stack || message}`
})

export const winstonConfig = {
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true }),
                logFormat,
            ),
        }),

        new winston.transports.File({
            filename: "error.log",
            level: "error",
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true }),
                logFormat
            ),
        }),
    ],
};