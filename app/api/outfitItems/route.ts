import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

// Update the OutfitItem interface
interface OutfitItem {
  'product link': string;
  'apparel name': string;
  'apparel image': string;
  'item-price': number;
  type: string;
  brand: string;
}

// Add a new interface for the categorized items
interface CategorizedOutfitItems {
  upper: OutfitItem[];
  lower: OutfitItem[];
  headgear: OutfitItem[];
  footwear: OutfitItem[];
}

// Add this interface above the GET function
interface CSVRow {
  'product link': string;
  'apparel name': string;
  'apparel image': string;
  'item-price'?: string;
  price?: string;
  type: string;
  brand: string;
}

export async function GET() {
  console.log('API route called');

  const filePath = path.join(process.cwd(), 'data', 'updated_apparel.csv');
  console.log('CSV file path:', filePath);

  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    console.log('CSV file read successfully');

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    console.log(`Parsed ${records.length} rows from CSV`);

    const outfitItems: OutfitItem[] = records.map((row: CSVRow) => ({
      'product link': row['product link'],
      'apparel name': row['apparel name'],
      'apparel image': row['apparel image'],
      'item-price': parseFloat(row['item-price'] || row.price || '0'),
      type: row.type.toLowerCase(),
      brand: row.brand,
    }));

    // Initialize categorized items
    const categorizedItems: CategorizedOutfitItems = {
      upper: [],
      lower: [],
      headgear: [],
      footwear: [],
    };

    // Categorize items
    outfitItems.forEach((item: OutfitItem) => {
      switch (item.type) {
        case 'upper':
          categorizedItems.upper.push(item);
          break;
        case 'lower':
          categorizedItems.lower.push(item);
          break;
        case 'headgear':
          categorizedItems.headgear.push(item);
          break;
        case 'footwear':
          categorizedItems.footwear.push(item);
          break;
        default:
          console.warn(`Unknown category: ${item.type} for item: ${item['apparel name']}`);
      }
    });

    console.log('Outfit items processed');
    // Log a few items to check the prices
    Object.entries(categorizedItems).forEach(([category, items]) => {
      console.log(`${category} sample prices:`, items.slice(0, 3).map((item: OutfitItem) => item['item-price']));
    });

    return NextResponse.json(categorizedItems);
  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
