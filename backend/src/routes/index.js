import { Router } from 'express';
import authRoutes from './auth.routes.js';
import membershipRoutes from './membership.routes.js';
import contactRoutes from './contact.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import donationRoutes from './donation.routes.js';
import eventRoutes from './event.routes.js';
import courseRoutes from './course.routes.js';
import magazineRoutes from './magazine.routes.js';
import contentRoutes from './content.routes.js';
import blogRoutes from './blog.routes.js';
import progressRoutes from './progress.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'muis-backend' });
});

router.use('/auth', authRoutes);
router.use('/membership', membershipRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/donations', donationRoutes);
router.use('/events', eventRoutes);
router.use('/courses', courseRoutes);
router.use('/magazine', magazineRoutes);
router.use('/content', contentRoutes);
router.use('/blogs', blogRoutes);
router.use('/progress', progressRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;
