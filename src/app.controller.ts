import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUsers(
    @Query('search') search: string,
    @Query('first') first: number,
    @Query('max') max: number,
  ) {
    return this.appService.getUsers(search, first, max);
  }

  @Get('/count')
  getUsersCount() {
    return this.appService.getUsersCount();
  }

  @Get(':id')
  getUserById(@Param() params) {
    return this.appService.getUserById(params.id);
  }

  @Get(':id/credentials')
  getUserCredentials(@Param() params) {
    return this.appService.getUserCredentials(params.id);
  }

  @Get('student/:id')
  getStudent(@Param() params) {
    return this.appService.getStudentById(params.id);
  }

  @Get('tutor/:id')
  getTutor(@Param() params) {
    return this.appService.getTutorById(params.id);
  }
}
