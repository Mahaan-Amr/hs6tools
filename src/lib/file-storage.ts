import { writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

export interface StoredFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  path: string;
}

export class FileStorage {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    // For development, store files in public/uploads directory
    this.uploadDir = join(process.cwd(), 'public', 'uploads');
    this.baseUrl = '/uploads';
  }

  async ensureUploadDirectory(): Promise<void> {
    try {
      await access(this.uploadDir);
    } catch {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async storeFile(file: File, category: string = 'general'): Promise<StoredFile> {
    await this.ensureUploadDirectory();

    // Create category subdirectory
    const categoryDir = join(this.uploadDir, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(file.name);
    const fileName = `${timestamp}-${randomSuffix}${extension}`;
    
    // Full path for storage
    const filePath = join(categoryDir, fileName);
    
    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    
    // Write file to disk
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `${this.baseUrl}/${category}/${fileName}`;

    return {
      id: `img_${timestamp}_${randomSuffix}`,
      name: fileName,
      originalName: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      path: filePath
    };
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.substring(lastDotIndex);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(category: string, filename: string): string {
    return `${this.baseUrl}/${category}/${filename}`;
  }
}

// Create singleton instance
export const fileStorage = new FileStorage();
