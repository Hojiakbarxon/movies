import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class Crypto {
    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 7);
    };
    async compare(data: string, hashedData: string): Promise<boolean> {
        return await bcrypt.compare(data, hashedData);
    }
}