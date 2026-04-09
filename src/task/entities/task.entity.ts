import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Tag } from "./tag.entity";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  title!: string;

  @Column("text")
  description!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column()
  status!: TaskStatus;

  @Column()
  priority!: TaskPriority;

  @ManyToOne(() => User, (user) => user.tasks)
  // TypeORM יוצר אוטומטית עמודת assignedToId בטבלת tasks
  assignedTo!: User;

  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable() //מחזיק ב - Forign Key
  // ⭐ object אחד!
  tags!: Tag[];
}
