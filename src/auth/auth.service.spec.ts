import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock user data
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: '$2b$10$hashedpassword123',
    tasks: [],
  };

  const mockUserService = {
    create: jest.fn(),
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully create a new user and return access token', async () => {
      // Arrange
      const signupDto: SignupDto = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };

      const hashedPassword = '$2b$10$hashedpassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.signup(signupDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...signupDto,
        password: hashedPassword,
      });
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe(mockUser.username);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should hash the password before creating user', async () => {
      // Arrange
      const signupDto: SignupDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'plainpassword',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      // Act
      await service.signup(signupDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
    });
  });

  describe('login', () => {
    it('should successfully login user and return access token', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUserService.findByUsername).toHaveBeenCalledWith(loginDto.username);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('שם משתמש או סיסמה שגויים');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'wrongpassword',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('שם משתמש או סיסמה שגויים');
    });

    it('should not call JwtService.sign when credentials are invalid', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'wrongpassword',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('generated-token');

      // Act
      await service.login(loginDto);

      // Assert
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should return user data without password', async () => {
      // Arrange
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('tasks');
    });
  });
});
