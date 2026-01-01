import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./enitities/user.entity";
import { SignupDto } from "src/auth/dto/signup.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Create a new user (password should already be hashed by AuthService)
  async create(signupDto: SignupDto): Promise<User> {
    const user = this.userRepository.create({
      name: signupDto.username,
      username: signupDto.username,
      email: signupDto.email,
      password: signupDto.password, // Already hashed by AuthService
    });
    return await this.userRepository.save(user);
  }
  // Find all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Find all users with their tasks (relations)
  async findAllWithTasks(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ["tasks"],
    });
  }

  // Find one user by ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Find user by username
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  // Find one user by ID with tasks (relations)
  async findOneWithTasks(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["tasks"],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Update user
  async update(id: number, name: string): Promise<User> {
    const user = await this.findOne(id);
    user.name = name;
    return await this.userRepository.save(user);
  }

  // Delete user
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // Get user's tasks count
  async getTasksCount(id: number): Promise<number> {
    const user = await this.findOneWithTasks(id);
    return user.tasks.length;
  }
}
