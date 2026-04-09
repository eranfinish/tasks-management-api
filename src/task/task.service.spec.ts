import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./task.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { User } from "../user/entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { TaskStatus } from "./enums/task-status.enum";
import { TaskPriority } from "./enums/task-priority.enum";

describe("TasksService", () => {
  let service: TasksService;

  // Mock Users
  const mockUser1: User = {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "$2b$10$hashedpassword123",
    tasks: [],
  };

  const mockUser2: User = {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    password: "$2b$10$hashedpassword456",
    tasks: [],
  };

  // Mock Tasks with more realistic data
  const mockTask1: Task = {
    id: 1,
    title: "Implement User Authentication",
    description: "Add JWT-based authentication system with login and signup endpoints",
    status: "OPEN",
    priority: "HIGH",
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: new Date("2024-01-15T10:00:00Z"),
    assignedTo: mockUser1,
    tags: [],
  };

  const mockTask2: Task = {
    id: 2,
    title: "Create Task Dashboard",
    description: "Build a responsive dashboard to display all user tasks with filtering options",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    created_at: new Date("2024-01-16T09:30:00Z"),
    updated_at: new Date("2024-01-17T14:20:00Z"),
    assignedTo: mockUser1,
    tags: [],
  };

  const mockTask3: Task = {
    id: 3,
    title: "Write API Documentation",
    description: "Document all API endpoints using Swagger/OpenAPI specification",
    status: "DONE",
    priority: "LOW",
    created_at: new Date("2024-01-10T08:00:00Z"),
    updated_at: new Date("2024-01-14T16:45:00Z"),
    assignedTo: mockUser1,
    tags: [],
  };

  const mockTask4: Task = {
    id: 4,
    title: "Database Migration",
    description: "Set up TypeORM migrations for production database schema",
    status: "OPEN",
    priority: "HIGH",
    created_at: new Date("2024-01-18T11:00:00Z"),
    updated_at: new Date("2024-01-18T11:00:00Z"),
    assignedTo: mockUser2,
    tags: [],
  };

  // Arrays of mock tasks
  const mockTasksForUser1: Task[] = [mockTask1, mockTask2, mockTask3];
  const mockAllTasks: Task[] = [mockTask1, mockTask2, mockTask3, mockTask4];

  // Mock repository methods
  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all tasks", async () => {
      // Arrange
      mockTaskRepository.find.mockResolvedValue(mockAllTasks);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockAllTasks);
      expect(result.length).toBe(4);
      expect(mockTaskRepository.find).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no tasks exist", async () => {
      // Arrange
      mockTaskRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe("findOne", () => {
    it("should return a task by id", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(mockTask1);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(mockTask1);
      expect(result.title).toBe("Implement User Authentication");
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should throw NotFoundException when task is not found", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow("Task #999 not found");
    });
  });

  describe("createTask", () => {
    it("should create a task for a user", async () => {
      // Arrange
      const createTaskDto = {
        title: "New Task",
        description: "New Description",
        status: TaskStatus.OPEN,
        priority: TaskPriority.HIGH,
        tags: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser1);
      mockTaskRepository.create.mockReturnValue({ ...createTaskDto, assignedTo: mockUser1 });
      mockTaskRepository.save.mockResolvedValue({ id: 5, ...createTaskDto, assignedTo: mockUser1 });

      // Act
      const result = await service.createTask(1, createTaskDto);

      // Assert
      expect(result).toHaveProperty("id");
      expect(result.title).toBe(createTaskDto.title);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when user is not found", async () => {
      // Arrange
      const createTaskDto = {
        title: "New Task",
        description: "New Description",
        status: TaskStatus.OPEN,
        priority: TaskPriority.HIGH,
        tags: [],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createTask(999, createTaskDto)).rejects.toThrow(NotFoundException);
      await expect(service.createTask(999, createTaskDto)).rejects.toThrow("User not found");
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      // Arrange
      const updateTaskDto = {
        title: "Updated Task - Completed",
        status: TaskStatus.DONE,
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask2);
      mockTaskRepository.save.mockResolvedValue({ ...mockTask2, ...updateTaskDto });

      // Act
      const result = await service.update(1, updateTaskDto);

      // Assert
      expect(result.title).toBe("Updated Task - Completed");
      expect(result.status).toBe(TaskStatus.DONE);
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when updating non-existent task", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { title: "Updated" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(mockTask3);
      mockTaskRepository.remove.mockResolvedValue(mockTask3);

      // Act
      await service.remove(3);

      // Assert
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask3);
    });

    it("should throw NotFoundException when removing non-existent task", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAllByUser", () => {
    it("should return all tasks for a specific user", async () => {
      // Arrange
      mockTaskRepository.find.mockResolvedValue(mockTasksForUser1);

      // Act
      const result = await service.findAllByUser(1);

      // Assert
      expect(result).toEqual(mockTasksForUser1);
      expect(result.length).toBe(3);
      expect(result[0].assignedTo.username).toBe("johndoe");
      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { assignedTo: { id: 1 } },
        relations: ['assignedTo'],
      });
    });
  });

  describe("findOneByUser", () => {
    it("should return a task for a specific user", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(mockTask1);

      // Act
      const result = await service.findOneByUser(1, 1);

      // Assert
      expect(result).toEqual(mockTask1);
      expect(result.title).toBe("Implement User Authentication");
      expect(result.assignedTo.id).toBe(1);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, assignedTo: { id: 1 } },
        relations: ['assignedTo'],
      });
    });

    it("should throw NotFoundException when task doesn't belong to user", async () => {
      // Arrange
      mockTaskRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneByUser(1, 999)).rejects.toThrow(NotFoundException);
      await expect(service.findOneByUser(1, 999)).rejects.toThrow("Task #1 not found or you don't have access to it");
    });
  });

  describe("getTasksLength", () => {
    it("should return the total number of tasks", async () => {
      // Arrange
      mockTaskRepository.find.mockResolvedValue(mockAllTasks);

      // Act
      const total = await service.getTasksLength();

      // Assert
      expect(total).toBe(4);
      expect(mockTaskRepository.find).toHaveBeenCalledTimes(1);
    });

    it("should return 0 when no tasks exist", async () => {
      // Arrange
      mockTaskRepository.find.mockResolvedValue([]);

      // Act
      const total = await service.getTasksLength();

      // Assert
      expect(total).toBe(0);
    });
  });
});
