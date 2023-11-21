import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './tasks-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

export class TasksRepository extends Repository<Task> {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {
    super(
      tasksRepository.target,
      tasksRepository.manager,
      tasksRepository.queryRunner,
    );
  }

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDTO: CreateTaskDTO): Promise<Task> {
    const { title, description } = createTaskDTO;

    const task: Task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.save(task);

    return task;
  }

  async fetchTaskById(id: string): Promise<Task> {
    const found: Task | undefined = await this.findOne({ where: { id } });

    if (!found) throw new NotFoundException(`Task with ID ${id} not found`);

    return found;
  }

  async deleteTask(id: string): Promise<void> {
    const found: Task | undefined = await this.findOne({ where: { id } });

    if (!found) throw new NotFoundException(`Task with ID ${id} not found`);

    await this.delete({ id });
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task: Task | undefined = await this.fetchTaskById(id);

    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
