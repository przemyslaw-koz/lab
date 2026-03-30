import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('Auth Service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create instance of an auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates new user with salted and hashed password', async () => {
    const user = await service.signup('test@example.com', 'testpassword');

    expect(user.password).not.toEqual('testpassword');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error when user signs up with email already in use', async () => {
    await service.signup('test@example.com', 'password');

    await expect(service.signup('test@example.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('test@example.com', '1234')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('test@example.com', 'password');
    await expect(
      service.signin('test@example.com', 'incorrect'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns user if correct password is passed', async () => {
    await service.signup('test@example.com', 'password');

    const user = await service.signin('test@example.com', 'password');
    expect(user).toBeDefined();
  });
});
