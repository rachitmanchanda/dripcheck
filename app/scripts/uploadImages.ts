import { uploadFile } from '@uploadcare/upload-client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const UPLOADCARE_PUBLIC_KEY = 'your_public_key_here';

async function uploadImages() {
  const results: OutfitItem[] = [];
  const filePath = path.join(process.cwd(), 'data', 'updated_apparel.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        if (row['apparel image']) {
          try {
            const file = await fs.promises.readFile(path.join(process.cwd(), 'images', path.basename(row['apparel image'])));
            const result = await uploadFile(file, {
              publicKey: UPLOADCARE_PUBLIC_KEY,
              store: 'auto',
              metadata: {
                apparel_name: row['apparel name'],
                brand: row.brand,
                type: row.type
              }
            });
            row['apparel image'] = result.cdnUrl;
            console.log(`Uploaded: ${row['apparel name']} - ${result.cdnUrl}`);
          } catch (error) {
            console.error(`Failed to upload ${row['apparel name']}:`, error);
          }
        }
      }

      // Write updated CSV
      const csvWriter = createCsvWriter({
        path: path.join(process.cwd(), 'data', 'updated_apparel_with_uploadcare.csv'),
        header: Object.keys(results[0]).map(key => ({id: key, title: key}))
      });
      
      await csvWriter.writeRecords(results);
      console.log('CSV file has been updated with Uploadcare URLs');
    });
}

uploadImages();
