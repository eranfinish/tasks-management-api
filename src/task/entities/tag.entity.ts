import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Task } from "./task.entity";

@Entity("tags")
export class Tag {
  // ... columns ...
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];
  // אין @JoinTable!
}
