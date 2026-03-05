import { UserRepository } from '../repositories/user.repository';
import { User, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: { firstName: string; lastName: string; email: string; birthday: string; location: string }): Promise<User> {
    // Validate timezone
    if (!DateTime.local().setZone(data.location).isValid) {
      throw new Error(`Invalid timezone location: ${data.location}`);
    }

    // Convert birthday string to Date object
    const birthdayDate = new Date(data.birthday);
    if (isNaN(birthdayDate.getTime())) {
      throw new Error('Invalid birthday date format');
    }

    return this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthday: birthdayDate,
      location: data.location,
    });
  }

  async deleteUser(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return this.userRepository.delete(id);
  }

  async updateUser(id: number, data: Partial<{ firstName: string; lastName: string; email: string; birthday: string; location: string }>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');

    const updateData: Prisma.UserUpdateInput = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    
    if (data.location) {
      if (!DateTime.local().setZone(data.location).isValid) {
        throw new Error(`Invalid timezone location: ${data.location}`);
      }
      updateData.location = data.location;
    }

    if (data.birthday) {
      const birthdayDate = new Date(data.birthday);
      if (isNaN(birthdayDate.getTime())) {
        throw new Error('Invalid birthday date format');
      }
      updateData.birthday = birthdayDate;
    }

    return this.userRepository.update(id, updateData);
  }
}
