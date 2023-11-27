import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class AuthCredentialsDTO {
  @IsString()
  @MinLength(4, { message: 'Username is too short (minimum 4 characters)' })
  @MaxLength(16, { message: 'Username is too long (maximum 16 characters)' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Password is too short (minimum 6 characters)' })
  @MaxLength(32, { message: 'Password is too long (maximum 32 characters)' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$!%*?&]+$/, {
    message:
      'Password too weak. It must contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  password: string;
}
