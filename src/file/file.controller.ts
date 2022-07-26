import {
  Controller,
  Get,
  Query,
  Headers,
  StreamableFile,
  Res,
  Render,
} from '@nestjs/common';
import { createReadStream, statSync } from 'fs';
import * as open from 'open';

// const TEST_FILE_PATH = '/Users/yanggun7201/Desktop/1- Welcome.mp4';
const TEST_FILE_PATH = '/Volumes/TOSHIBA EXT/_Vector_Video/vokoscreenNG-2022-06-15_13-29-03.mp4';

function escapeFilePath(filePath) {
  return filePath
    .replaceAll(' ', '\\ ')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]');
}

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
  fileDownload(@Query('filepath') filePath2): StreamableFile {
    console.log('download filePath2', filePath2);
    const filePath = filePath2;
    // const filePath = TEST_FILE_PATH;
    console.log('download filePath', filePath);
    // const file = createReadStream(`\\"${filePath}\\"`);
    const file = createReadStream(filePath);
    // const file = createReadStream(escapeFilePath(filePath));
    return new StreamableFile(file);
  }

  @Get('details')
  @Render('details.hbs')
  async details(@Query('filepath') filePath) {
    return { filePath };
  }

  @Get('watch')
  watch(
    @Res() res,
    @Query('filepath') filePath2,
    @Headers('range') range,
  ): void {
    // const filePath =
    //   ++count % 2 === 0 ? filePath2 : __dirname + '/1-Welcome.mp4';
    const filePath = filePath2;
    // const filePath = TEST_FILE_PATH;
    console.log('filePath', filePath);
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const escapedFilePath = filePath;
    // const escapedFilePath = filePath.replaceAll(' ', '\\ ');

    console.log('range', range);
    if (range) {
      // Parse Range
      // Example: 'bytes=6750208-'
      const CHUNK_SIZE = 5 * 10 ** 5; // ~500 KB => 500000 Bytes
      const start = Number(range.replace(/\D/g, '')); // 'bytes=6750208-' => 6750208
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
      console.log(start);
      console.log(end);
      const chunkSize = end - start + 1;
      console.log('chunkSize', chunkSize);
      console.log('fileSize', fileSize);

      const file = createReadStream(escapedFilePath, { start, end });
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      createReadStream(escapedFilePath).pipe(res);

      // thumbsupply
    }
  }
}
