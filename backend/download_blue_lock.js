const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
    request.on('error', reject);
  });
};

const run = async () => {
  const bDest = path.join(UPLOADS_DIR_BACKEND, 'blue_lock.jpg');
  const fDest = path.join(UPLOADS_DIR_FRONTEND, 'blue_lock.jpg');
  try {
    console.log('Downloading blue_lock.jpg alternative...');
    await downloadFile('https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500', bDest);
    fs.copyFileSync(bDest, fDest);
    console.log('Successfully processed blue_lock.jpg');
  } catch (err) {
    console.error('Failed to download blue_lock.jpg:', err.message);
  }
};

run();
