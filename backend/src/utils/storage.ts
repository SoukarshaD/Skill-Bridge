import fs from "fs";
import path from "path";
import { promisify } from "util";
import stream from "stream";
import crypto from "crypto";

const pipeline = promisify(stream.pipeline);

export interface StorageProvider {
  saveFile(fileStream: stream.Readable, ext: string): Promise<string>;
  getFileStream(key: string): fs.ReadStream;
  deleteFile(key: string): Promise<void>;
  getFileSize(key: string): Promise<number>;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(fileStream: stream.Readable, ext: string): Promise<string> {
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}${ext}`;
    const filePath = path.join(this.baseDir, fileName);
    
    const writeStream = fs.createWriteStream(filePath);
    await pipeline(fileStream, writeStream);
    
    return fileName;
  }

  getFileStream(key: string): fs.ReadStream {
    const filePath = path.join(this.baseDir, key);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }
    return fs.createReadStream(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getFileSize(key: string): Promise<number> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      const stats = await fs.promises.stat(filePath);
      return stats.size;
    }
    return 0;
  }
}

// Export a singleton instance of the current provider
// This makes it trivial to swap with an S3StorageProvider later
export const storageService: StorageProvider = new LocalStorageProvider();
