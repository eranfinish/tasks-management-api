import { Test, TestingModule } from "@nestjs/testing";
import { TaskController } from "./task.controller";
import { TasksService } from "./task.service";

describe("TaskController", () => {
  let controller: TaskController;

  const mockTasksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllByUser: jest.fn(),
    findOneByUser: jest.fn(),
    getTasksLength: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
