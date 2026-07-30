import fs from 'fs';
import path from 'path';

const srcFile = 'C:/Users/safaa/Downloads/google-services (2).json';
const destFile = 'E:/global-market-iq/android/app/google-services.json';

if (fs.existsSync(srcFile)) {
  fs.copyFileSync(srcFile, destFile);
  console.log('✓ Successfully copied google-services.json to:', destFile);
} else {
  console.error('Source file not found at:', srcFile);
}
