import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../secondary/user/controller/user.controller';
import { UserService } from '../../secondary/user/service/user.service';
import { UserEntity } from '../../../domain/user/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

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
      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const user = new UserEntity('1', 'John', 'john@example.com');
      mockUserService.create.mockResolvedValue(user);

      const result = await controller.create({
        name: 'John',
        email: 'john@example.com',
      });
      expect(result.id).toBe('1');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = new UserEntity('1', 'John Updated', 'john@example.com');
      mockUserService.update.mockResolvedValue(user);

      const result = await controller.update('1', { name: 'John Updated' });
      expect(result.name).toBe('John Updated');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update('999', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      mockUserService.delete.mockResolvedValue(undefined);
      await expect(controller.remove('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.delete.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
