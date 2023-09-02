import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId, GridFSBucketReadStream } from 'mongodb';
import { Readable } from 'stream';
import { ErrorType } from './types/error.type';

@Injectable()
export class FileService {
  private bucket: GridFSBucket;
  constructor(@InjectConnection() private connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db);
  }

  async findAudioByTherapistId(therapistId: string) {
    return this.bucket
      .find(
        { 'metadata.therapistId': therapistId },
        { projection: { filename: 1, 'metadata.clientId': 1 } },
      )
      .toArray();
  }

  async uploadFile(
    fileName: string,
    file: Buffer,
    metadata?: Record<string, any>,
  ): Promise<{ id: string | null }> {
    const readableStream = new Readable();
    readableStream.push(file);
    readableStream.push(null);

    const uploadStream = this.bucket.openUploadStream(fileName, {
      ...(metadata ? { metadata } : {}),
    });
    readableStream.pipe(uploadStream);

    return new Promise((resolve) => {
      uploadStream.on('error', () => {
        throw new InternalServerErrorException(ErrorType.UPLOAD_FILE_ERROR);
      });

      uploadStream.on('finish', () => {
        resolve({ id: uploadStream.id.toString() });
      });
    });
  }

  getDownloadStreamFile(id: string): GridFSBucketReadStream {
    let objId: ObjectId;
    try {
      objId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException(ErrorType.ID_NOT_FOUND);
    }

    const downloadStream = this.bucket.openDownloadStream(objId);

    return downloadStream;
  }

  removeFile(id: string) {
    let objId: ObjectId;
    try {
      objId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException(ErrorType.ID_NOT_FOUND);
    }

    return this.bucket.delete(objId);
  }

  findFile(id: string) {
    let objId: ObjectId;
    try {
      objId = new ObjectId(id);
    } catch (error) {
      throw new NotFoundException(ErrorType.ID_NOT_FOUND);
    }

    return this.bucket.find({ _id: objId }).toArray();
  }
}
