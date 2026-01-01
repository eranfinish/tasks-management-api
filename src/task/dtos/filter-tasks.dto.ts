import { IsOptional, IsEnum } from "class-validator";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";

export class FilterTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: "סטטוס חייב להיות אחד מהערכים: OPEN, IN_PROGRESS, DONE",
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: "עדיפות חייבת להיות אחת מהערכים: LOW, MEDIUM, HIGH",
  })
  priority?: TaskPriority;
}
