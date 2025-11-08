import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// API route to serve ZarinPal verification file
// This ensures the file is accessible even if middleware interferes
export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', '28569823.txt');
    const fileContent = await readFile(filePath, 'utf-8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error reading verification file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}

