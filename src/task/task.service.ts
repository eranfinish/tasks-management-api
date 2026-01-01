import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { CreateTaskDto, UpdateTaskDto } from "./dtos";
//import { Tag } from "./entities/tag.entity";
import { User } from "../user/enitities/user.entity";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return await this.tasksRepository.save(task);
  }

  // Create a task assigned to a specific user
  async createTask(userId: number, data: CreateTaskDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const task = this.tasksRepository.create({
      ...data,
      assignedTo: user,
    });

    return await this.tasksRepository.save(task);
  }


  async findAll(): Promise<Task[]> {
    return await this.tasksRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    console.log(task);
    Object.assign(task, updateTaskDto);
    return await this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  // Methods with user filtering for authentication

  /**
   * Find all tasks for a specific user
   */
  async findAllByUser(userId: number): Promise<Task[]> {
    return await this.tasksRepository.find({
      where: { assignedTo: { id: userId } },
      relations: ['assignedTo'],
    });
  }

  /**
   * Find one task by ID for a specific user
   */
  async findOneByUser(id: number, userId: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, assignedTo: { id: userId } },
      relations: ['assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found or you don't have access to it`);
    }

    return task;
  }

  /**
   * Update task for a specific user
   */
  async updateByUser(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.findOneByUser(id, userId);
    Object.assign(task, updateTaskDto);
    return await this.tasksRepository.save(task);
  }

  /**
   * Remove task for a specific user
   */
  async removeByUser(id: number, userId: number): Promise<void> {
    const task = await this.findOneByUser(id, userId);
    await this.tasksRepository.remove(task);
  }
  
  async getTasksLength(): Promise<number>{
    return  (await this.findAll()).length;
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { Task } from './interfaces/task.interface';
// import { CreateTaskDto } from './dtos/create-task.dto';
// import { UpdateTaskDto } from './dtos/update-task.dto';
// import { FilterTasksDto } from './dtos/filter-tasks.dto';
// import { TaskStatus } from './enums/task-status.enum';
// import { TaskPriority } from './enums/task-priority.enum';

// @Injectable()
// export class TaskService {
//   // אחסון זיכרון זמני
//   private tasks: Task[] = [
//   { id: 1, title: 'משימה 1', description: 'תיאור משימה 1', status: TaskStatus.OPEN, priority: TaskPriority.HIGH, createdAt: new Date(), updatedAt: new Date() },
//   { id: 2, title: 'משימה 2', description: 'תיאור משימה 2', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, createdAt: new Date(), updatedAt: new Date() },
//   { id: 3, title: 'משימה 3', description: 'תיאור משימה 3', status: TaskStatus.DONE, priority: TaskPriority.LOW, createdAt: new Date(), updatedAt: new Date() },
//   ];
//   private idCounter = 1;

//   /**
//    * מחזיר את כל המשימות עם אפשרות לסינון
//    * @param filterDto - אובייקט סינון אופציונלי (status ו/או priority)
//    * @returns מערך משימות מסוננות
//    */
//   findAll(filterDto?: FilterTasksDto): Task[] {
//     let filteredTasks = this.tasks;

//     // סינון לפי status אם קיים
//     if (filterDto?.status) {
//       filteredTasks = filteredTasks.filter(task => task.status === filterDto.status);
//     }

//     // סינון לפי priority אם קיים
//     if (filterDto?.priority) {
//       filteredTasks = filteredTasks.filter(task => task.priority === filterDto.priority);
//     }

//     return filteredTasks;
//   }

//   /**
//    * מחזיר משימה בודדת לפי ID
//    * @param id - מזהה המשימה
//    * @returns המשימה שנמצאה
//    * @throws NotFoundException אם המשימה לא נמצאה
//    */
//   findOne(id: number): Task {
//     const task = this.tasks.find(task => task.id === id);

//     if (!task) {
//       throw new NotFoundException(`משימה עם ID ${id} לא נמצאה`);
//     }

//     return task;
//   }

//   /**
//    * יוצר משימה חדשה
//    * @param createTaskDto - נתוני המשימה החדשה
//    * @returns המשימה שנוצרה
//    */
//   create( createTaskDto: CreateTaskDto): Task {
//     const now = new Date();

//     const task: Task = {
//       id: this.idCounter++,
//       title: createTaskDto.title,
//       description: createTaskDto.description,
//       status: createTaskDto.status,
//       priority: createTaskDto.priority,
//       createdAt: now,
//       updatedAt: now,
//     };

//     this.tasks.push(task);
//     return task;
//   }

//   /**
//    * מעדכן משימה קיימת
//    * @param id - מזהה המשימה לעדכון
//    * @param updateTaskDto - השדות לעדכון
//    * @returns המשימה המעודכנת
//    * @throws NotFoundException אם המשימה לא נמצאה
//    */
//   update(id: number, updateTaskDto: UpdateTaskDto): Task {
//     const task = this.findOne(id); // זורק NotFoundException אם לא נמצא

//     // עדכון השדות שהתקבלו
//     if (updateTaskDto.title !== undefined) {
//       task.title = updateTaskDto.title;
//     }
//     if (updateTaskDto.description !== undefined) {
//       task.description = updateTaskDto.description;
//     }
//     if (updateTaskDto.status !== undefined) {
//       task.status = updateTaskDto.status;
//     }
//     if (updateTaskDto.priority !== undefined) {
//       task.priority = updateTaskDto.priority;
//     }

//     // עדכון תאריך השינוי
//     task.updatedAt = new Date();

//     return task;
//   }

//   /**
//    * מוחק משימה
//    * @param id - מזהה המשימה למחיקה
//    * @throws NotFoundException אם המשימה לא נמצאה
//    */
//   remove(id: number): void {
//     const index = this.tasks.findIndex(task => task.id === id);

//     if (index === -1) {
//       throw new NotFoundException(`משימה עם ID ${id} לא נמצאה`);
//     }

//     this.tasks.splice(index, 1);
//   }
// }
