import * as jwt from "jsonwebtoken"
import { envConfig } from "./env.config"
import { Response } from "express"
import { Injectable } from "@nestjs/common";


@Injectable()
export class Token {
    getAccessToken(payload: object): string {
        let secretKey = envConfig.token.access.key;
        let accessToken = jwt.sign(payload, secretKey, {
            expiresIn: '1d',
        })

        return accessToken
    };

    getRefreshToken(res: Response, payload: object): string {
        let secretKey = envConfig.token.refresh.key
        let refreshToken = jwt.sign(payload, secretKey, {
            expiresIn: '7d'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 3600 * 1000,
            sameSite : "none"
        });

        return refreshToken
    };

    verifyAccessToken(accessToken: string): string | jwt.JwtPayload {
        let secretKey = envConfig.token.access.key
        return jwt.verify(accessToken, secretKey);
    };

    verifyRefreshToken(refreshToken: string): string | jwt.JwtPayload {
        let secretKey = envConfig.token.refresh.key;
        return jwt.verify(refreshToken, secretKey);
    };
}