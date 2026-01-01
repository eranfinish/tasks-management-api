import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TasksService } from "./task.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { User } from "../user/enitities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  controllers: [TaskController],
  providers: [TasksService],
})
export class TaskModule {}
