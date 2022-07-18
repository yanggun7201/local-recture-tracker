import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as open from 'open';

@Controller('file')
export class FileController {
  @Get()
  async getFile(
    @Query('filepath') filePath,
  ): Promise<{ message: string; filePath: string }> {
    console.log('filePath', filePath, '\n', filePath.replaceAll(' ', '\\ '));
    await open(filePath);
    return {
      message: 'success',
      filePath,
    };
  }

  @Get('download')
  fileDownload(@Query('filepath') filePath): StreamableFile {
    console.log('filePath', filePath);
    // const file = createReadStream(filePath);
    const file = createReadStream(filePath.replaceAll(' ', '\\ '));
    return new StreamableFile(file);
  }
}
