import { readFile } from 'fs/promises';

export async function getProjectPackageJson() {
  try {
    const packageJson = await readFile('package.json', 'utf8');
    const packageData = JSON.parse(packageJson);
    return await packageData;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return null;
  }
}
