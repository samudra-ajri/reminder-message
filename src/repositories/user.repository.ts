import { prisma } from '../utils/prisma';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
