import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const inputFilePath = path.join(process.cwd(), 'data', 'updated_apparel.csv');
const outputFilePath = path.join(process.cwd(), 'data', 'test_output.csv');

const results = [];

console.log('Starting CSV read/write test...');
console.log('Input file:', inputFilePath);
console.log('Output file:', outputFilePath);

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    console.log(`Read ${results.length} rows from CSV`);

    // Modify the data slightly (e.g., add a test field)
    results.forEach(row => {
      row['test_field'] = 'test value';
    });

    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: Object.keys(results[0]).map(key => ({ id: key, title: key }))
    });

    csvWriter.writeRecords(results)
      .then(() => {
        console.log('CSV file has been written successfully');
        console.log('Output file location:', outputFilePath);
      })
      .catch((error) => {
        console.error('Error writing CSV:', error);
      });
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
