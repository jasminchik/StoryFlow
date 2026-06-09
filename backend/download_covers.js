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

const imagesToDownload = [
  { name: 'naruto.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg' },
  { name: 'bleach.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/7/72/BleachCoverTankobon1.jpg' },
  { name: 'one_piece.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/a3/One_Piece%2C_Volume_1.jpg' },
  { name: 'solo_leveling.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Solo_Leveling_Volume_1_Cover.jpg' },
  { name: 'chainsaw_man.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Chainsaw_Man_volume_1_cover.png' },
  { name: 'jujutsu_kaisen.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_Kaisen_volume_1_cover.jpg' },
  { name: 'black_clover.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/52/Black_Clover%2C_Volume_1.jpg' },
  { name: 'blue_lock.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Blue_Lock_volume_1_cover.jpg' },
  { name: 'berserk.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/4/45/Berserk_vol_01.jpg' },
  { name: 'tokyo_ghoul.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Tokyo_Ghoul_volume_1_cover.jpg' },
  { name: 'vinland_saga.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/a/ad/Vinland_Saga_volume_1_cover.jpg' },
  { name: 'my_hero_academia.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png' },
  { name: 'demon_slayer.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg' },
  { name: 'hells_paradise.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b5/Hell%27s_Paradise_-_Jigokuraku%2C_volume_1_cover.jpg' },
  { name: 'spy_x_family.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Spy_x_Family_volume_1_cover.jpg' },
  { name: 'oshi_no_ko.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Oshi_no_Ko_volume_1_cover.jpg' },
  { name: 'attack_on_titan.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg' },
  { name: 'totoro.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/0/02/My_Neighbor_Totoro_-_concept_art.jpg' },
  { name: 'tower_of_god.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/d/df/Tower_of_God_Volume_1_Cover.jpg' },
  { name: 'mavka.png', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/POSTER_MAVKA._THE_FOREST_SONG.png' },
  { name: 'carpathians.jpg', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500' },
  { name: 'novel.jpg', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    // Use images.weserv.nl as a caching proxy for Wikipedia images to avoid 429 / 403 errors
    let targetUrl = url;
    if (url.includes('wikimedia.org')) {
      targetUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }

    const urlParsed = new URL(targetUrl);
    const options = {
      hostname: urlParsed.hostname,
      path: urlParsed.pathname + urlParsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    };

    const request = https.get(options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download from ${targetUrl}. Status code: ${response.statusCode}`));
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
  console.log(`Starting download of ${imagesToDownload.length} covers using Weserv proxy and saving to backend & frontend...`);
  
  for (const img of imagesToDownload) {
    const backendDest = path.join(UPLOADS_DIR_BACKEND, img.name);
    const frontendDest = path.join(UPLOADS_DIR_FRONTEND, img.name);
    
    // Check if we already have it in both places
    const hasBackend = fs.existsSync(backendDest) && fs.statSync(backendDest).size > 1000;
    const hasFrontend = fs.existsSync(frontendDest) && fs.statSync(frontendDest).size > 1000;
    
    if (hasBackend && hasFrontend) {
      console.log(`${img.name} already exists in both backend and frontend, skipping.`);
      continue;
    }
    
    try {
      if (!hasBackend) {
        console.log(`Downloading ${img.name} to backend...`);
        await downloadFile(img.url, backendDest);
        console.log(`Successfully downloaded ${img.name} to backend.`);
        await sleep(500); // polite delay
      }
      
      // Copy to frontend
      console.log(`Copying ${img.name} to frontend...`);
      fs.copyFileSync(backendDest, frontendDest);
      console.log(`Successfully copied ${img.name} to frontend.`);
      
    } catch (err) {
      console.error(`Error processing ${img.name}:`, err.message);
      await sleep(1000);
    }
  }
  console.log('Finished downloading and copying covers! 🎉');
};

run();
