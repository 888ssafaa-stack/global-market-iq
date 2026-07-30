import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = `C:\\Users\\safaa\\.gemini\\antigravity\\brain\\e74fbab4-b5de-45f3-b508-9f83c9018419\\app_icon_v2_1785351975284.jpg`;
const baseDir = `E:\\global-market-iq`;

const targets = [
  // PWA Android
  { path: 'public/android/launchericon-512x512.png', size: 512 },
  { path: 'public/android/launchericon-192x192.png', size: 192 },
  { path: 'public/android/launchericon-144x144.png', size: 144 },
  { path: 'public/android/launchericon-96x96.png', size: 96 },
  { path: 'public/android/launchericon-72x72.png', size: 72 },
  { path: 'public/android/launchericon-48x48.png', size: 48 },

  // PWA iOS
  { path: 'public/ios/192.png', size: 192 },
  { path: 'public/ios/180.png', size: 180 },
  { path: 'public/ios/167.png', size: 167 },
  { path: 'public/ios/152.png', size: 152 },
  { path: 'public/favicon.ico', size: 32 },

  // Android Native Mipmaps
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', size: 48 },
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', size: 48 },
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png', size: 48 },

  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', size: 72 },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', size: 72 },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png', size: 72 },

  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', size: 96 },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png', size: 96 },

  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', size: 144 },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png', size: 144 },

  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', size: 192 },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', size: 192 },
];

async function generateIcons() {
  console.log('Generating icons from:', sourceImage);
  for (const item of targets) {
    const fullPath = path.join(baseDir, item.path);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await sharp(sourceImage)
      .resize(item.size, item.size)
      .png()
      .toFile(fullPath);
    console.log(`✓ Generated ${item.path} (${item.size}x${item.size})`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
