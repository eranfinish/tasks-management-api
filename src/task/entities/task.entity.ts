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
import { User } from "../../user/enitities/user.entity";
import { Tag } from "./tag.entity";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100 })
  title: string;
  @Column("text")
  description: string; // 🔗 Relation

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  @Column()
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  @Column()
  priority: "LOW" | "MEDIUM" | "HIGH";

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinTable() //מחזיק את הקשר בין הטבלה של
  // המשימות לטבלה של המשתמשים
  assignedTo: User;

  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable() //מחזיק ב - Forign Key
  // ⭐ object אחד!
  tags: Tag[];
}
