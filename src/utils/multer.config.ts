import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const avatarMulterOptions = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (_req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
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
  storage: diskStorage({
    destination: './uploads/posters',
    filename: (req, file, callback) => {
      callback(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
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
  storage: diskStorage({
    destination: './uploads/movies',
    filename: (req, file, callback) => {
      callback(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(new BadRequestException('Only MP4, WEBM, or MOV videos are allowed'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
};