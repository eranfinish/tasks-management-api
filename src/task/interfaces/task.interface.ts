import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}
