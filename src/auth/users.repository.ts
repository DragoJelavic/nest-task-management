import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { DUPLICATE_UNIQUE_VALUE_CODE } from './error-codes';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDTO } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    super(
      usersRepository.target,
      usersRepository.manager,
      usersRepository.queryRunner,
    );
  }

  async createUser(authCredentialsDto: AuthCredentialsDTO): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      username,
      password: hashedPassword,
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === DUPLICATE_UNIQUE_VALUE_CODE) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    loginCredentialsDto: LoginCredentialsDTO,
  ): Promise<{ access_token: string }> {
    const { username, password } = loginCredentialsDto;

    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    delete user.password;

    return this.signToken(user.id, username);
  }

  async signToken(
    userId: string,
    username: string,
  ): Promise<{ access_token: string }> {
    const payload: JwtPayload = { userId, username };
    const secret: string = this.config.get('JWT_SECRET');

    const accessToken: string = await this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token: accessToken };
  }
}
