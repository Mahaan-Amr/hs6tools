import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// API route to serve ZarinPal verification file
// This is a fallback in case the public folder file doesn't work
export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', '28569823.txt');
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileContent = await readFile(filePath, 'utf-8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error reading verification file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

