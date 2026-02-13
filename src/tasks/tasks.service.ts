import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './create-task.dto';
import { Task } from './task.entity';
import { TaskStatus } from './task.model';
import { UpdateTaskDto } from './update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  public findAll(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  public async findOne(id: string): Promise<Task | NotFoundException> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  public async create(body: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.save({
      ...body,
      status: TaskStatus.OPEN,
    });
  }

  public async updateStatus(
    id: string,
    status: TaskStatus,
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);

    if (task instanceof NotFoundException) {
      return task;
    }
    await this.tasksRepository.update(id, { status });
    return this.findOne(id);
  }

  public async update(
    id: string,
    body: UpdateTaskDto,
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      return task;
    }
    await this.tasksRepository.update(id, body);
    return this.findOne(id);
  }

  public async delete(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    await this.tasksRepository.delete(id);
    return;
  }
}
