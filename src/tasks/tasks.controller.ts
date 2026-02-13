import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParamsDto } from './find-one.params.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Get()
  public async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get('/:id')
  public async findOne(
    @Param() params: FindOneParamsDto,
  ): Promise<Task | NotFoundException> {
    return this.tasksService.findOne(params.id);
  }

  @Post()
  public async create(@Body() body: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(body);
  }

  @Patch('/:id/status')
  public updateStatus(
    @Param() params: FindOneParamsDto,
    @Body() body: UpdateTaskStatusDto,
  ): Promise<Task | NotFoundException> {
    return this.tasksService.updateStatus(params.id, body.status);
  }

  @Patch('/:id')
  public update(
    @Param() params: FindOneParamsDto,
    @Body() body: UpdateTaskDto,
  ): Promise<Task | NotFoundException> {
    return this.tasksService.update(params.id, body);
  }

  @Patch('/:id/labels')
  public addLabels(
    @Param() { id }: FindOneParamsDto,
    @Body() body: CreateTaskLabelDto[],
  ): Promise<Task | NotFoundException> {
    return this.tasksService.addLabels(id, body);
  }

  @Delete('/:id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() { id }: FindOneParamsDto,
    @Body() labelNames: string[],
  ): Promise<void> {
    await this.tasksService.removeLabels(id, labelNames);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param() params: FindOneParamsDto): Promise<void> {
    return this.tasksService.delete(params.id);
  }
}
