import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TaskStatus } from '../tasks-status.enum';

export class UpdateTaskStatusDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
