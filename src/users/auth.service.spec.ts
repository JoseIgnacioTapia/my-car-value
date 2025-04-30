import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with an email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'asdf@asdf.com', password: 'asdf' } as User,
      ]);

    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('Throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('vdgscdgs@vfgh.com', 'vgcsdfb'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'asdf@asdf.com', password: 'correct-password' } as User,
      ]);

    service.signin('fdfgdgf@hjjhkj.com', 'wrong-password').catch((error) => {
      try {
        expect(error).toBeInstanceOf(BadRequestException);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('Returns a user if correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'sdsds@fds.com', password: 'hashed-password' } as User,
      ]);

    const user = await service.signin('asdf@asdf.com', 'hsdflkhp');
    expect(user).toBeDefined();
  });
});
