import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  UseGuards,
  UseInterceptors,
  Request,
} from "@nestjs/common";
import { TasksService } from "./task.service";
import { CreateTaskDto } from "./dtos/create-task.dto";
import { UpdateTaskDto } from "./dtos/update-task.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor";
import { TransformInterceptor } from "../common/interceptors/transform.interceptor";

@Controller("tasks")
//@UseGuards(JwtAuthGuard)
//@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class TaskController {
  constructor(private readonly taskService: TasksService) {}

  /**
   * מחזיר את כל המשימות (ללא אימות)
   */
  @Get()
  getAllTasks() {
    return this.taskService.findAll();
  }

  /**
   * מחזיר משימה בודדת לפי ID
   * @param id - מזהה המשימה
   */
  @Get(":id")
  getTaskById(@Param("id", ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  /**
   * יוצר משימה חדשה (ללא אימות - צריך להוסיף userId ידנית)
   * @param createTaskDto - נתוני המשימה החדשה
   */
  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    // Temporarily using hardcoded userId = 1 for testing without auth
    return this.taskService.createTask(1, createTaskDto);
  }

  /**
   * מעדכן משימה קיימת
   * @param id - מזהה המשימה
   * @param updateTaskDto - השדות לעדכון
   */
  @Patch(":id")
  updateTask(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  /**
   * מוחק משימה
   * @param id - מזהה המשימה למחיקה
   */
  @Delete(":id")
  @HttpCode(204)
  async deleteTask(@Param("id", ParseIntPipe) id: number) {
    await this.taskService.remove(id);
  }
}
