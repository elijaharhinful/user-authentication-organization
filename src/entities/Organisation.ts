import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { User } from "./User";

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn("uuid")
  orgId!: string;

  @Column()
  @IsNotEmpty()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => User, (user) => user.organisations)
  owner!: User;

  @ManyToMany(() => User)
  @JoinTable()
  users!: User[];
}
