import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../../../domain/user/user.entity';
import { Prisma } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[0].name).toBe('John');
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', name: 'John', email: 'john@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById('1');
      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe('1');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.findById('999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const newUser = { name: 'John', email: 'john@example.com' };
      const createdUser = { id: '1', ...newUser };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(newUser);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe('john@example.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Email already exists', {
          code: 'P2002',
          clientVersion: 'mock',
        }),
      );
      await expect(
        service.create({ name: 'John', email: 'john@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updatedUser = {
        id: '1',
        name: 'John Updated',
        email: 'john@example.com',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', { name: 'John Updated' });
      expect(result.name).toBe('John Updated');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: 'mock',
        }),
      );
      await expect(service.update('999', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: '1' });
      await expect(service.delete('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: 'mock',
        }),
      );
      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
