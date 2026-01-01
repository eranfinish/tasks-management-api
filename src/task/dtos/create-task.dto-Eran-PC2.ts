/* eslint-disable prettier/prettier */
import { MaxLength, MinLength, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { TaskStatus } from "../enums/task-status.enum";
//import { getPriority } from "os";

export class CreateTaskDto {
  @ApiProperty({
    description: "The unique identifier of the task",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "The title of the task",
    minLength: 3,
    maxLength: 50,
    example: "Complete project documentation",
  })
  @MinLength(3, {
    message: "Title is too short. Minimum length is $constraint1 characters",
  })
  @MaxLength(50, {
    message: "Title is too long. Maximum length is $constraint1 characters",
  })
  title: string;

  @ApiProperty({
    description: "Detailed description of the task",
    example: "Write comprehensive documentation for the API endpoints",
  })
  description: string;

  @ApiProperty({
    description: "Current status of the task",
    enum: TaskStatus,
    example: TaskStatus.OPEN,
  })
  @IsEnum(TaskStatus, {
    message:
      "Status must be one of: OPEN, IN_PROGRESS, DONE, BLOCKED, CANCELLED",
  })
  status: TaskStatus;
}
