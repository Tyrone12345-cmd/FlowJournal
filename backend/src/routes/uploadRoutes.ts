import { Router, Response } from 'express';
import { upload, getFileUrl } from '../utils/fileUpload';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Upload single screenshot
router.post('/screenshot', authenticate, upload.single('screenshot'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    
    res.status(200).json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
      userId: req.user?.userId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Upload multiple screenshots
router.post('/screenshots', authenticate, upload.array('screenshots', 10), (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      url: getFileUrl(req, file.filename),
    }));

    res.status(200).json({
      success: true,
      files,
      userId: req.user?.userId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

export default router;
