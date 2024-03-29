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

async function filteredSortedFileNames(rootPath) {
  let fileNames;
  try {
    fileNames = await fsPromises.readdir(rootPath);
  } catch (error) {
    console.log(error);
    return [];
  }

  return fileNames
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
}

async function getFiles(rootPath) {
  const fileNames = await filteredSortedFileNames(rootPath);

  const results = [];
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];

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

const MAXIMUM_NUMBER_LENGTH = 3;

function parseChapterNumber(fileName: string, searchString: string) {
  const end = Math.min(fileName.indexOf(searchString), MAXIMUM_NUMBER_LENGTH);
  return fileName.substring(0, end);
}

const getChapterNumber = (fileName: string): number | null => {
  if (fileName.includes('.')) {
    const num = Number(parseChapterNumber(fileName, '.'));
    if (!isNaN(num)) {
      return num;
    }
  }
  if (fileName.includes('-')) {
    const num = Number(parseChapterNumber(fileName, '-'));
    if (!isNaN(num)) {
      return num;
    }
  }

  return null;
};
