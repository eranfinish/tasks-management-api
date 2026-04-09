import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { SignupDto } from "../auth/dto/signup.dto";
import { Repository } from "typeorm";

describe("UserService", () => {
  let service: UserService;
  let repository: Repository<User>;

  // Mock users
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

  const mockUserWithTasks: User = {
    ...mockUser1,
    tasks: [
      {
        id: 1,
        title: "Task 1",
        description: "Description 1",
        status: "OPEN",
        priority: "HIGH",
        created_at: new Date(),
        updated_at: new Date(),
        assignedTo: mockUser1,
        tags: [],
      },
      {
        id: 2,
        title: "Task 2",
        description: "Description 2",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        created_at: new Date(),
        updated_at: new Date(),
        assignedTo: mockUser1,
        tags: [],
      },
    ],
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create a new user", async () => {
      // Arrange
      const signupDto: SignupDto = {
        username: "johndoe",
        email: "john@example.com",
        password: "$2b$10$hashedpassword123",
      };

      mockUserRepository.create.mockReturnValue(mockUser1);
      mockUserRepository.save.mockResolvedValue(mockUser1);

      // Act
      const result = await service.create(signupDto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: signupDto.username,
        username: signupDto.username,
        email: signupDto.email,
        password: signupDto.password,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser1);
    });

    it("should create user with hashed password", async () => {
      // Arrange
      const signupDto: SignupDto = {
        username: "testuser",
        email: "test@example.com",
        password: "$2b$10$hashedpassword",
      };

      mockUserRepository.create.mockReturnValue(mockUser1);
      mockUserRepository.save.mockResolvedValue(mockUser1);

      // Act
      await service.create(signupDto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: signupDto.password,
        })
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      // Arrange
      const mockUsers = [mockUser1, mockUser2];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no users exist", async () => {
      // Arrange
      mockUserRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe("findAllWithTasks", () => {
    it("should return all users with their tasks", async () => {
      // Arrange
      const usersWithTasks = [mockUserWithTasks, mockUser2];
      mockUserRepository.find.mockResolvedValue(usersWithTasks);

      // Act
      const result = await service.findAllWithTasks();

      // Assert
      expect(result).toEqual(usersWithTasks);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ["tasks"],
      });
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser1);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(mockUser1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException when user is not found", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "User with ID 999 not found"
      );
    });
  });

  describe("findByUsername", () => {
    it("should return a user by username", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser1);

      // Act
      const result = await service.findByUsername("johndoe");

      // Assert
      expect(result).toEqual(mockUser1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: "johndoe" },
      });
    });

    it("should return null when user is not found", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByUsername("nonexistent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findOneWithTasks", () => {
    it("should return a user with tasks by id", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUserWithTasks);

      // Act
      const result = await service.findOneWithTasks(1);

      // Assert
      expect(result).toEqual(mockUserWithTasks);
      expect(result.tasks.length).toBe(2);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["tasks"],
      });
    });

    it("should throw NotFoundException when user is not found", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneWithTasks(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update a user's name", async () => {
      // Arrange
      const updatedUser = { ...mockUser1, name: "John Updated" };
      mockUserRepository.findOne.mockResolvedValue(mockUser1);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(1, "John Updated");

      // Assert
      expect(result.name).toBe("John Updated");
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when user does not exist", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, "New Name")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser1);
      mockUserRepository.remove.mockResolvedValue(mockUser1);

      // Act
      await service.remove(1);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser1);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getTasksCount", () => {
    it("should return the number of tasks for a user", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUserWithTasks);

      // Act
      const count = await service.getTasksCount(1);

      // Assert
      expect(count).toBe(2);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["tasks"],
      });
    });

    it("should return 0 when user has no tasks", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser1);

      // Act
      const count = await service.getTasksCount(1);

      // Assert
      expect(count).toBe(0);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTasksCount(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
