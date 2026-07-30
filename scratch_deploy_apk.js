import fs from 'fs';
import path from 'path';

const sourceApk = 'E:/global-market-iq/android/app/build/outputs/apk/debug/app-debug.apk';

if (fs.existsSync(sourceApk)) {
  const stat = fs.statSync(sourceApk);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Official Android Gradle APK found (${sizeMB} MB / ${stat.size} bytes)`);

  const dests = [
    'E:/global-market-iq/public/global-market-iq.apk',
    'E:/global-market-iq/public/app-release.apk',
    'E:/global-market-iq/android/app/build/outputs/apk/release/app-release.apk'
  ];

  dests.forEach(dest => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(sourceApk, dest);
    console.log(`✓ Copied official APK to ${dest}`);
  });
} else {
  console.error('ERROR: sourceApk not found at', sourceApk);
}
