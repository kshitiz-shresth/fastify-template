import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_BUCKET_REGION || "",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_KEY || "",
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME || "";

    if (!this.bucketName) {
      throw new Error(
        "S3 bucket name is not configured in environment variables."
      );
    }
  }

  /**
   * Uploads a file to S3.
   * @param filePath - Local file path to upload.
   * @param s3Key - The key (path) to store the file under in S3.
   * @returns The uploaded file's URL.
   */
  async uploadFile(filePath: string, s3Key: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: this.getMimeType(filePath),
    };

    const command = new PutObjectCommand(params);

    try {
      await this.s3.send(command);
      return this.getFileUrl(s3Key);
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("File upload failed.");
    }
  }

  /**
   * Uploads a base64 encoded file to S3.
   * @param base64Content - The base64 string of the file content.
   * @param s3Key - The key (path) to store the file under in S3.
   * @param mimeType - The MIME type of the file.
   * @returns The uploaded file's URL.
   */
  async uploadBase64(
    base64Content: string,
    s3Key: string,
    mimeType: string
  ): Promise<string> {
    const buffer = Buffer.from(base64Content, "base64");
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);

    try {
      await this.s3.send(command);
      return this.getFileUrl(s3Key);
    } catch (error) {
      console.error("Error uploading base64 content to S3:", error);
      throw new Error("Base64 file upload failed.");
    }
  }

  /**
   * Deletes a file from S3.
   * @param s3Key - The key (path) of the file to delete in S3.
   */
  async deleteFile(s3Key: string): Promise<void> {
    if (s3Key.includes("amazonaws.com/")) {
      s3Key = s3Key.split("amazonaws.com/")[1];
    }
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
    };
    const command = new DeleteObjectCommand(params);
    try {
      await this.s3.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new Error("File deletion failed.");
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    s3Key: string,
    mimeType: string
  ): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
      };

      const command = new PutObjectCommand(params);
      await this.s3.send(command);
      return this.getFileUrl(s3Key);
    } catch (error) {
      console.error("Error uploading buffer to S3:", error);
      throw new Error("Buffer upload failed.");
    }
  }

  /**
   * Generates a public URL for an S3 object.
   * @param s3Key - The key (path) of the file in S3.
   * @returns The file's public URL.
   */
  getFileUrl(s3Key: string): string {
    return `https://${this.bucketName}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;
  }

  /**
   * Retrieves the MIME type based on the file extension.
   * @param filePath - Local file path.
   * @returns The MIME type of the file.
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".html": "text/html",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }

  /**
   * Retrieves the file extension based on the MIME type.
   * @param mimeType - The MIME type of the file.
   * @returns The file extension.
   */
  getExtension(mimeType: string): string {
    const mimeTypes: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
      "text/plain": ".txt",
      "text/html": ".html",
    };

    return mimeTypes[mimeType] || ".bin";
  }
}
