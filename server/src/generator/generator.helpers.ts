import { readFile } from 'fs/promises';

export async function getProjectFileData(path: string) {
  try {
    const file = await readFile(path, 'utf8');
    const fileData = JSON.parse(file);
    return fileData;
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return null;
  }
}
