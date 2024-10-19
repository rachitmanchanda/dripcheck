import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const UPLOADCARE_PUBLIC_KEY = 'd4ed555a03c433f2283a';
const UPLOADCARE_SECRET_KEY = 'f3348699b88482b08734'; // Replace with your actual secret key

// Define an interface for the expected response structure
interface UploadcareResponse {
  results: {
    uuid: string;
    original_file_url: string;
    original_filename: string;
  }[];
  next: string | null;
  previous: string | null;
  total: number;
}

// Type guard function to check if the data matches the expected structure
function isUploadcareResponse(data: unknown): data is UploadcareResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as UploadcareResponse).results) &&
    (data as UploadcareResponse).results.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'uuid' in item &&
        'original_file_url' in item &&
        'original_filename' in item
    ) &&
    'next' in data &&
    'previous' in data &&
    'total' in data
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';

  const url = `https://api.uploadcare.com/files/?limit=${limit}&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
        'Accept': 'application/vnd.uploadcare-v0.7+json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as unknown;

    // Check if data has the expected structure
    if (isUploadcareResponse(data)) {
      const formattedFiles = data.results.map(file => ({
        uuid: file.uuid,
        cdnUrl: file.original_file_url,
        originalFilename: file.original_filename,
      }));

      return NextResponse.json({ 
        success: true, 
        images: formattedFiles,
        next: data.next,
        previous: data.previous,
        total: data.total
      });
    } else {
      throw new Error('Unexpected response structure from Uploadcare API');
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch images' }, { status: 500 });
  }
}
