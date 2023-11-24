import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { LoginCredentialsDTO } from './dto/login-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDTO): Promise<void> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    loginCredentialsDto: LoginCredentialsDTO,
  ): Promise<{ access_token: string }> {
    return this.usersRepository.signIn(loginCredentialsDto);
  }
}
