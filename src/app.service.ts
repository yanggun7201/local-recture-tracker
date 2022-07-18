import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const fsPromises = fs.promises;

@Injectable()
export class AppService {
  async getList(): Promise<string[]> {
    return await getFiles(process.env.LECTURE_DIR_PATH);
  }
}

async function getFiles(rootPath) {
  let fileNames;
  try {
    fileNames = await fsPromises.readdir(rootPath);
  } catch (error) {
    console.log(error);
  }

  const filteredFileNames = fileNames
    .filter((fileName: string) => !fileName.startsWith('.'))
    .sort((a, b) => {
      const aNum = getChapterNumber(a);
      const bNum = getChapterNumber(b);
      if (aNum !== null && bNum !== null) {
        if (aNum > bNum) return 1;
        if (aNum < bNum) return -1;
        return 0;
      }
      return a.localeCompare(b);
    });

  const results = [];
  for (let i = 0; i < filteredFileNames.length; i++) {
    const fileName = filteredFileNames[i];

    let children;
    const isDirectory = fs
      .lstatSync(path.join(rootPath, fileName))
      .isDirectory();

    if (isDirectory) {
      children = await getFiles(`${rootPath}/${fileName}`);
    } else if (path.extname(fileName) !== '.mp4') {
      continue;
    }

    results.push({
      link: `${rootPath}/${fileName}`,
      name: fileName,
      isDirectory,
      children,
    });
  }

  return results;
}

const getChapterNumber = (fileName: string): number | null => {
  if (fileName.includes('.')) {
    return Number(fileName.substring(0, fileName.indexOf('.')));
  }
  if (fileName.includes('-')) {
    return Number(fileName.substring(0, fileName.indexOf('-')));
  }

  return null;
};
