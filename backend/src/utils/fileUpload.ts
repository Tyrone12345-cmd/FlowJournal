import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';

const baseUploadsDir = path.join(__dirname, '../../uploads/screenshots');

// Ensure base directory exists
if (!fs.existsSync(baseUploadsDir)) {
  fs.mkdirSync(baseUploadsDir, { recursive: true });
}

// Configure storage with user-specific folders
const storage = multer.diskStorage({
  destination: (req: AuthRequest, file: Express.Multer.File, cb) => {
    // Create user-specific directory
    const userId = req.user?.userId || 'anonymous';
    const userDir = path.join(baseUploadsDir, userId);
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `screenshot-${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Helper function to delete file
export const deleteFile = (userId: string, filename: string): void => {
  const filePath = path.join(baseUploadsDir, userId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to get file URL
export const getFileUrl = (req: AuthRequest, filename: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  const userId = req.user?.userId || 'anonymous';
  return `${protocol}://${host}/uploads/screenshots/${userId}/${filename}`;
};
