import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { PendingUser } from "../entities/pending.user.entity";
import { ProcessingUser } from "../entities/processing.user.entity";

@Injectable()
export class Schedule {
    constructor(
        @InjectRepository(PendingUser) private readonly penUserRepo: Repository<PendingUser>,
        @InjectRepository(ProcessingUser) private readonly proUserRepo: Repository<ProcessingUser>
    ) { }

    @Cron(CronExpression.EVERY_2_HOURS)
    async clearPendingUser(): Promise<boolean> {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        await this.penUserRepo.delete({
            expires_in: LessThan(twoHoursAgo)
        });

        return true
    };

    @Cron(CronExpression.EVERY_2_HOURS)
    async clearProcessingUser(): Promise<boolean> {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        await this.proUserRepo.delete({
            expires_in: LessThan(twoHoursAgo)
        });

        return true;
    }
}