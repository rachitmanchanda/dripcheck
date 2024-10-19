import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { UploadClient } from '@uploadcare/upload-client';

const client = new UploadClient({ publicKey: 'd4ed555a03c433f2283a' });

const inputFilePath = path.join(process.cwd(), 'data', 'updated_apparel.csv');
const outputFilePath = path.join(process.cwd(), 'data', 'updated_apparel_with_uploadcare.csv');

async function updateCsv() {
  const results: OutfitItem[] = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Read ${results.length} rows from CSV`);

    for (const row of results) {
      try {
        console.log(`Uploading image for ${row['apparel name']}...`);
        const file = await client.uploadFile(row['apparel image']);
        row['apparel image'] = file.cdnUrl;
        console.log(`Uploaded successfully. New URL: ${file.cdnUrl}`);
      } catch (error) {
        console.error(`Failed to upload image for ${row['apparel name']}:`, error);
      }
    }

    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: Object.keys(results[0]).map(key => ({ id: key, title: key }))
    });

    await csvWriter.writeRecords(results);
    console.log('CSV file has been updated with Uploadcare links');
  } catch (error) {
    console.error('Error updating CSV:', error);
  }
}

updateCsv();
