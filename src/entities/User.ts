import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Organisation } from "./Organisation";

@Entity()
@Unique(["userId","email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column()
  @IsNotEmpty({ message: "First name is required" })
  firstName!: string;

  @Column()
  @IsNotEmpty({ message: "Last name is required" })
  lastName!: string;

  @Column()
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @Column()
  @IsNotEmpty({ message: "Password is required" })
  password!: string;

  @Column({ nullable: true })
  phone!: string;

  @OneToMany(() => Organisation, (organisation) => organisation.owner)
  organisations!: Organisation[];
}
