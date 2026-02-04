import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../secondary/user/controller/user.controller';
import { UserService } from '../../secondary/user/service/user.service';
import { UserEntity } from '../../../domain/user/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of UserResponseDto', async () => {
      const users = [new UserEntity('1', 'John', 'john@example.com')];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
    });
  });

  describe('findOne', () => {
    it('should return UserResponseDto', async () => {
      const user = new UserEntity('1', 'John', 'john@example.com');
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      mockUserService.findById.mockResolvedValue(null);
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const user = new UserEntity('1', 'John', 'john@example.com');
      mockUserService.create.mockResolvedValue(user);

      const result = await controller.create({ name: 'John', email: 'john@example.com' });
      expect(result.id).toBe('1');
    });
  });
});

