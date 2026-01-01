import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Task } from "../../task/entities/task.entity";


@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ length: 100 })
  name: string; // 🔗 Relation

  @Column({ length: 50, nullable: true })
  username: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;
  
  @OneToMany(() => Task, (task) => task.assignedTo)
  tasks: Task[]; // ⭐ array!
}
