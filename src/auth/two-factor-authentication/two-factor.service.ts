import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { envConfig } from '../../utils/env.config';

@Injectable()
export class TwoFactorService {
    constructor() {
        authenticator.options = { step: 30, window: 0 };
    }

    generateSecret(): string {
        return authenticator.generateSecret(20); // 160-bit base32 secret
    }

    buildOtpauthUrl(email: string, secret: string): string {
        return authenticator.keyuri(email, envConfig.token.twoFactor.issuer, secret);
    }

    verify(otp: string, secret: string): boolean {
        try {
            return authenticator.check(otp, secret);
        } catch {
            return false;
        }
    }

    private get key(): Buffer {
        return Buffer.from(envConfig.token.twoFactor.encryptionKey, 'hex'); // must be 32 bytes
    }

    encrypt(plain: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
        const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return [iv, tag, enc].map((b) => b.toString('hex')).join(':');
    }

    decrypt(payload: string): string {
        const [iv, tag, enc] = payload.split(':').map((h) => Buffer.from(h, 'hex'));
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    }
}