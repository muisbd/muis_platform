import { Router } from 'express';
import multer from 'multer';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { uploadBuffer, cloudinaryReady } from '../utils/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const router = Router();

router.post(
  '/',
  authRequired,
  requireRoles('admin', 'moderator', 'blogger'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file uploaded.');
    if (!cloudinaryReady()) {
      throw new HttpError(503, 'File storage is not configured yet. Add Cloudinary credentials.');
    }
    const url = await uploadBuffer(req.file.buffer, 'muis', req.file.originalname);
    res.json({ ok: true, url });
  })
);

export default router;
