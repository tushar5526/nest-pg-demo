import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUsers(@Query('msg') msg: string) {
    return this.appService.callStoredProcedure(msg);
  }
}
