import fs from 'fs';
import path from 'path';

const publicDir = 'E:/global-market-iq/public';
['app-release.apk', 'global-market-iq.apk'].forEach(file => {
  const p = path.join(publicDir, file);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Removed recursive APK: ${p}`);
  }
});

const androidAssets = 'E:/global-market-iq/android/app/src/main/assets/public';
if (fs.existsSync(androidAssets)) {
  fs.rmSync(androidAssets, { recursive: true, force: true });
  console.log(`Cleaned android assets folder: ${androidAssets}`);
}
