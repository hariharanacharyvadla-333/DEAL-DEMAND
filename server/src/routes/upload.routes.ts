import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({ success: false, message: 'File upload failed.' });
  }
});

export default router;
