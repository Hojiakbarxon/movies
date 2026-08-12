import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Processing User")
export class ProcessingUser {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    // @Column({ type: 'varchar', length: 255 })
    // password_hash: string;

    @Column({ type: 'varchar', nullable: false })
    otp: string;

    @CreateDateColumn({ type: "timestamp" })
    expires_in: Date;
}