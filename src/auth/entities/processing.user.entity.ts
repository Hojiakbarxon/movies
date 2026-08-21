import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OTPUser } from "../../utils/base.entity";

@Entity("Processing User")
export class ProcessingUser extends OTPUser{
}