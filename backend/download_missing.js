const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR_BACKEND = path.join(__dirname, 'uploads');
const UPLOADS_DIR_FRONTEND = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

// Create directories if they don't exist
if (!fs.existsSync(UPLOADS_DIR_BACKEND)) {
  fs.mkdirSync(UPLOADS_DIR_BACKEND, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR_FRONTEND)) {
  fs.mkdirSync(UPLOADS_DIR_FRONTEND, { recursive: true });
}

const missingImages = [
  { name: 'bleach.jpg', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500' },
  { name: 'solo_leveling.jpg', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500' },
  { name: 'chainsaw_man.jpg', url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500' },
  { name: 'jujutsu_kaisen.jpg', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
  { name: 'black_clover.jpg', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500' },
  { name: 'blue_lock.jpg', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500' },
  { name: 'berserk.jpg', url: 'https://images.unsplash.com/photo-1559893088-c0787ebfc084?w=500' },
  { name: 'tokyo_ghoul.jpg', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500' },
  { name: 'vinland_saga.jpg', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500' },
  { name: 'hells_paradise.jpg', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500' },
  { name: 'spy_x_family.jpg', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500' },
  { name: 'oshi_no_ko.jpg', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500' },
  { name: 'tower_of_god.jpg', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500' }
];

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed with status: ${response.statusCode}`));
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

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  console.log(`Starting download of ${missingImages.length} missing covers to backend and copying to frontend...`);
  
  for (const img of missingImages) {
    const bDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const fDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    
    try {
      console.log(`Downloading ${img.name}...`);
      await downloadFile(img.url, bDest);
      fs.copyFileSync(bDest, fDest);
      console.log(`Successfully processed ${img.name}`);
    } catch (err) {
      console.error(`Error processing ${img.name}:`, err.message);
    }
  }
  console.log('Finished downloading all missing covers! 🎉');
};

run();
