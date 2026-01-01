import { PartialType } from "@nestjs/mapped-types";
import { CreateTaskDto } from "./create-task.dto";

// PartialType הופך את כל השדות לאופציונליים
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
