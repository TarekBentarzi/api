import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../../secondary/user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../../../domain/user/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const user = new UserEntity(
        '1',
        'John Doe',
        'john@example.com',
        'hashedPassword',
      );
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'john@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const user = new UserEntity(
        '1',
        'John Doe',
        'john@example.com',
        'hashedPassword',
      );
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'john@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('should return null when user has no password', async () => {
      const user = new UserEntity('1', 'John Doe', 'john@example.com');
      mockUserService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'john@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data when credentials are valid', async () => {
      const user = new UserEntity(
        '1',
        'John Doe',
        'john@example.com',
        'hashedPassword',
      );
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'john@example.com',
        sub: '1',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
