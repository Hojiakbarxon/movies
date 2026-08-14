import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const avatarMulterOptions = {
  storage: memoryStorage(),
  fileFilter: (_req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Only JPEG, PNG, or WEBP images are allowed'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

export const posterMulterOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(new BadRequestException('Only JPEG, PNG, or WEBP images are allowed'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

export const movieFileMulterOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(new BadRequestException('Only MP4, WEBM, or MOV videos are allowed'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
};