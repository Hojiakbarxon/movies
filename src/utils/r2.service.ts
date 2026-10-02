import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class R2Service {
    private readonly client: S3Client;
    private readonly bucket = process.env.R2_BUCKET_NAME as string;
    private readonly publicUrl = process.env.R2_PUBLIC_URL as string;

    constructor() {
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            },
        });
    }

    async upload(file: Express.Multer.File, folder: 'avatars' | 'posters' | 'movies'): Promise<string> {
        const key = `${folder}/${uuidv4()}${extname(file.originalname)}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return `${this.publicUrl}/${key}`;
    }

    async delete(fileUrl: string): Promise<void> {
        const key = fileUrl.replace(`${this.publicUrl}/`, '');
        await this.client.send(
            new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
    }
}