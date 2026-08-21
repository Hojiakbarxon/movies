import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OTPUser } from "../../utils/base.entity";

@Entity("Pending User")
export class PendingUser extends OTPUser {
    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash: string;
}