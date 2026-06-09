const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

const failedImages = [
  { name: 'totoro.jpg', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500' },
  { name: 'tower_of_god.jpg', url: 'https://images.unsplash.com/photo-1516315720917-231ef9afe462?w=500' },
  { name: 'mavka.png', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500' }
];

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
  console.log('Downloading alternative high-quality images for the 3 failed covers...');
  for (const img of failedImages) {
    const bDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const fDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    try {
      console.log(`Downloading ${img.name}...`);
      await downloadFile(img.url, bDest);
      fs.copyFileSync(bDest, fDest);
      console.log(`Successfully processed ${img.name}`);
    } catch (err) {
      console.error(`Failed ${img.name}:`, err.message);
    }
  }
  console.log('Finished processing failed covers! 🎉');
};

run();
