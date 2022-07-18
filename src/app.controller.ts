import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('chapters.hbs')
  async getList() {
    const chapters = await this.appService.getList();
    return { chapters };
  }
}
