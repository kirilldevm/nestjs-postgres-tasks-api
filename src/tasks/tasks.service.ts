import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { CreateTaskDto } from './create-task.dto';
import { TaskLabel } from './task-label.entity';
import { Task } from './task.entity';
import { TaskStatus } from './task.model';
import { UpdateTaskDto } from './update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private taskLabelsRepository: Repository<TaskLabel>,
  ) {}

  public findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ['labels'] });
  }

  public async findOne(id: string): Promise<Task | NotFoundException> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  public async create(body: CreateTaskDto): Promise<Task> {
    if (body.labels) {
      body.labels = this.getUniqueLabels(body.labels);
    }
    return this.tasksRepository.save({
      ...body,
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
    if (task instanceof NotFoundException) return task;

    // const isLabelExists = body?.labels?.some((label) =>
    //   task.labels.some((taskLabel) => taskLabel.name === label.name),
    // );
    // if (isLabelExists) {
    //   throw new BadRequestException('Label already exists');
    // }

    if (body.labels) {
      body.labels = this.getUniqueLabels(body.labels);
    }

    Object.assign(task, body);
    await this.tasksRepository.save(task);

    return this.findOne(id);
  }

  public async addLabels(
    id: string,
    labelsDto: CreateTaskLabelDto[],
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      return task;
    }

    const names = task.labels.map((label) => label.name);
    const labels = this.getUniqueLabels(labelsDto)
      .filter((label) => !names.includes(label.name))
      .map((label) => this.taskLabelsRepository.create({ name: label.name }));

    if (labels.length > 0) {
      task.labels = [...task.labels, ...labels];
      return await this.tasksRepository.save(task);
    }

    return task;
  }

  public async removeLabels(
    id: string,
    labels: string[],
  ): Promise<Task | NotFoundException> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      return task;
    }
    task.labels = task.labels.filter((label) => !labels.includes(label.name));
    return await this.tasksRepository.save(task);
  }

  public async delete(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task instanceof NotFoundException) {
      throw task;
    }
    await this.tasksRepository.remove(task);
    return;
  }

  private getUniqueLabels(labels: CreateTaskLabelDto[]): CreateTaskLabelDto[] {
    const uniqueNames = [...new Set(labels.map((label) => label.name))];
    return uniqueNames.map((name) => ({ name }));
  }
}
