import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
} from "class-validator";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";
import { Tag } from "../entities/tag.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    description: "The title of the task",
    minLength: 3,
    maxLength: 100,
    example: "Complete project documentation",
  })
  @IsString({ message: "כותרת חייבת להיות טקסט" })
  @IsNotEmpty({ message: "כותרת היא שדה חובה" })
  @MinLength(3, { message: "כותרת חייבת להכיל לפחות 3 תווים" })
  @MaxLength(100, { message: "כותרת לא יכולה להכיל יותר מ-100 תווים" })
  title: string;

  @ApiProperty({
    description: "Detailed description of the task",
    minLength: 10,
    example: "Write comprehensive documentation for the API endpoints",
  })
  @IsString({ message: "תיאור חייב להיות טקסט" })
  @IsNotEmpty({ message: "תיאור הוא שדה חובה" })
  @MinLength(10, { message: "תיאור חייב להכיל לפחות 10 תווים" })
  description: string;

  @ApiProperty({
    description: "Current status of the task",
    enum: TaskStatus,
    example: TaskStatus.OPEN,
  })
  @IsEnum(TaskStatus, {
    message: "סטטוס חייב להיות אחד מהערכים: OPEN, IN_PROGRESS, DONE",
  })
  status: TaskStatus;

  @ApiProperty({
    description: "Priority level of the task",
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, {
    message: "עדיפות חייבת להיות אחת מהערכים: LOW, MEDIUM, HIGH",
  })
  priority: TaskPriority;

  @ApiProperty({
    description: "תגים המשויכים למשימה",
    example: [],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "תגיות חייבות להיות מערך" })
  tags?: Tag[];
}
