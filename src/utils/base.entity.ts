import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
}

export abstract class TimestampedEntity extends BaseEntity {
    @CreateDateColumn()
    created_at: Date;
}

export abstract class OTPUser extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;
    
    @Column({ type: 'varchar', nullable: false })
    otp: string;

    @CreateDateColumn({ type: "timestamp" })
    expires_in: Date;
}